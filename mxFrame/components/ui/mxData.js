(function ()
{
    class mxData
    {
        #private;

        constructor(name)
        {
            this.#private = {};
            this.#private.name = name;
            this.wrapper = null;
        }

        isContainer() { return false; }
        get count() { return 1; }
        get name() { return this.#private.name; }
        get value() { return null; }
        getValue(i) { return null; }
        setValue(i, val) { }
        setToDefault() { if (this.wrapper) this.wrapper.setToDefault(); }
        toString() { return ""; }
    }

    class mxInt extends mxData
    {
        #private;

        constructor(name, val)
        {
            super(name);

            this.#private = {};
            this.#private.value = parseInt(""+val);
        }

        get value() { return this.#private.value; }
        set value(val) { this.#private.value = parseInt(""+val); }
        toString() { return ""+this.value; }
    }

    class mxIntList extends mxData
    {
        #private;

        constructor(name)
        {
            super(name);
            
            this.#private = {};            
            this.#private.value = [];
        }

        isContainer() { return true; }
        get count() { return this.#private.value.length; }
        get value() { return this.count ? this.#private.value[0] : null; }
        getValue(i) { return i < this.count ? this.#private.value[i] : null; }
        setValue(i, val) 
        {  
            if (i < this.count) this.#private.value[i] = parseInt(""+val);
            else this.push(val);
        }
        push(value) { this.#private.value.push( parseInt(""+value)); }
        toString() { return ""+this.#private.value.join(","); }
    }

    class mxFloat extends mxData
    {
        #private;

        constructor(name, val)
        {
            super(name);
            this.#private = {};
            this.#private.value = parseFloat(""+val);
        }

        get value() { return this.#private.value; }
        set value(val) { this.#private.value = parseFloat(""+val); }
        toString() { return ""+this.value; }
    }

    class mxFloatList extends mxData
    {
        #private;

        constructor(name)
        {
            super(name);
            this.#private = {};
            this.#private.value = [];
        }

        isContainer() { return true; }
        get count() { return this.#private.value.length; }
        get value() { return this.count ? this.#private.value[0] : null; }
        getValue(i) { return i < this.count ? this.#private.value[i] : null; }
        setValue(i, val) 
        {  
            if (i < this.count) this.#private.value[i] = parseFloat(""+val);
            else this.push(val);
        }
        push(value) { this.#private.value.push( parseFloat(""+value)); }
        toString() { return ""+this.#private.value.join(","); }
    }

    class mxString extends mxData
    {
        #private;

        constructor(name, val)
        {
            super(name);
            this.#private = {};
            this.#private.value = ""+val;
        }

        get value() { return this.#private.value; }
        set value(val) { this.#private.value = ""+val; }
        toString() { return this.value; }
    }

    class mxStringList extends mxData
    {
        #private;

        constructor(name)
        {
            super(name);
            this.#private = {};
            this.#private.value = [];
        }

        isContainer() { return true; }
        get count() { return this.#private.value.length; }
        get value() { return this.count ? this.#private.value[0] : null; }
        getValue(i) { return i < this.count ? this.#private.value[i] : null; }
        setValue(i, val) 
        {  
            if (i < this.count) this.#private.value[i] = ""+val;
            else this.push(val);
        }
        push(value) { this.#private.value.push( ""+value); }
        toString() { return ""+this.#private.value.join(","); }
    }

    class DataSource
    {
        #private;

        constructor()
        {
            this.#private = {};
            this.#private.publicList = [];
        }

        get numPublics() { return this.#private.publicList.length; }

        getPublicByIndex(i) { return this.#private.publicList[i]; }

        getPublic(name)
        {
            for (let i in this.#private.publicList)
            {
                if (this.#private.publicList[i].name == name) return this.#private.publicList[i];
            }
            return null;
        }

        clearPublicList() { this.#private.publicList = []; }

        publish(data) { this.#private.publicList.push(data); }

        unpublish() 
        {
            for (let i in this.#private.publicList)
            {
                this.#private.publicList[i].setToDefault();
            }
        }

        remove(name)
        {
            let i = this.#private.publicList.findIndex(data => data.name == name);
            if (i > -1) 
            {
                this.#private.publicList[i].setToDefault();
                this.#private.publicList.splice(i,1);
            }
        }
    }

    class DataWrapper
    {
        #private;

        constructor(name, data)
        {
            this.#private = {};
            this.#private.index = 0;
            this.#private.name = name;
            this.#private.data = data;
        }

        setData(data) 
        { 
            if (this.#private.data) this.#private.data.wrapper = null;
            this.#private.data = data; 
            data.wrapper = this;
        }
        get name() { return this.#private.name; }
        get data() { return this.#private.data; }
        get count() { return this.#private.data ? this.#private.data.count : 0; }

        setToDefault()
        {
            if (this.#private.data) this.#private.data.wrapper = null;
            this.#private.data = mx.DataLibrary.getDefault(this.#private.name);
        }

        reset() { this.#private.index = 0; }

        get value() 
        {
            let val;
            if (this.#private.data.isContainer()) 
            {
                val = this.#private.data.getValue(this.#private.index);
                this.#advanceIndex();
            }
            else
                val = this.#private.data.value;
            return val;
        }

        #advanceIndex()
        {
            this.#private.index += 1;
            if (this.#private.index == this.count) this.reset();
        }
    }

    class DataLibrary
    {
        #private;

        constructor()
        {
            this.#private = {};
            this.#private.publics = {};
            this.#private.defaults = {};
            this.#private.emptyDefault = new mxString("default", "");
        }

        getDefault(name)
        {
            if (name in this.#private.defaults) return this.#private.defaults[name];
            return this.#private.emptyDefault;
        }

        setDefault(data)
        {
            this.#private.defaults[data.name] = data;
        }

        publish(source)
        {
            for (let i=0; i < source.numPublics; ++i)
            {
                let data = source.getPublicByIndex(i);
                let wrapper = null;

                if (data.name in this.#private.publics) wrapper = this.#private.publics[data.name];
                if (wrapper)
                {
                    wrapper.setData(data);
                }
                else
                {
                    wrapper = new DataWrapper(data.name, data);
                    data.wrapper = wrapper;
                    this.#private.publics[wrapper.name] = wrapper;
                }
            }
        }

        getData(name)
        {
            let ret = null;

            if (name in this.#private.publics) ret = this.#private.publics[name];
            if (ret != null) return ret;
      
            let data = null;
            if (name in this.#private.defaults) data = this.#private.defaults[name];
            if (!data) return ret;
      
            ret = new DataWrapper(data.name, data);
            data.wrapper = ret;
            this.#private.publics[ret.name] = ret;
      
            return ret;
        }
    }
    
    if (!mx.test) mx.test = {};
    mx.test.dataTest = function()
    {
        let source = new DataSource();        
        let lib = mx.DataLibrary;
   
        let value = new mxFloat("PI", 3.14159); // a single value data object
        let check = 0;

        let list = new mxStringList("NAMES"); // a list type data object
        list.push("Bob");
        list.push("George");
        list.push("David");

        // the source must publish something
        console.log("publish value for for PI and NAMES");
        source.publish(value);
        source.publish(list);
        lib.publish(source);

        // set a default. Note that the default type is a string, not a float
        console.log("set a default for PI");
        lib.setDefault(new mxString("PI", "You suck"));
   
        // fetch the float object
        console.log("what is value of PI?");
        let wrap = lib.getData("PI");
   
        // check what the value is using two methods.
        check = wrap.value;
        console.log("check: " + check + " " + wrap.data.toString());
   
        // modify the original in the source
        console.log("change value for PI. what is value?");
        value.value = 9.8;
   
        // check value in the consumer now
        check = wrap.value;
        console.log("check: " + check + " " + wrap.data.toString());

        // replace it with a new source
        console.log("replace published PI");
        let source2 = new DataSource();
        let value2 = new mxFloat("PI", 666);
        source2.publish(value2);
        lib.publish(source2);

        // check value in the consumer now
        console.log("what is value of PI?");
        check = wrap.value;
        console.log("check: " + check + " " + wrap.data.toString());

        // unpublish it   
        console.log("unpublish PI?");
        source2.unpublish();

        // check for default
        console.log("what is value of PI?");
        check = wrap.value;
        console.log("check: " + check + " " + wrap.data.toString());

        // using the list object
        console.log("what is value of NAMES?");
        let wrap2 = lib.getData("NAMES");
        for (let i = 0; i < wrap2.count; ++i)
        {
            let val = "";
            val = wrap2.value;
            console.log("name " + i + ": " + val);
        }
    
    }

    mx.DataLibrary = new DataLibrary();
    mx.DataWrapper = DataWrapper;
    mx.DataSource = DataSource;
    mx.Int = mxInt;
    mx.Float = mxFloat;
    mx.String = mxString;
    mx.IntList = mxIntList;
    mx.FloatList = mxFloatList;
    mx.StringList = mxStringList;
}
)();