(function ()
{
    class mxData
    {
        #name;

        constructor(name)
        {
            this.#name = name;
            this.wrapper = null;
        }

        isContainer() { return false; }
        get count() { return 1; }
        get name() { return this.#name; }
        get value() { return null; }
        getValue(i) { return null; }
        setToDefault() { if (this.wrapper) this.wrapper.setDefault(); }
        toString() { return ""; }
    }

    class mxInt extends mxData
    {
        #value;

        constructor(name, val)
        {
            super(name);
            this.#value = parseInt(""+val);
        }

        get value() { return this.#value; }
        set value(val) { this.#value = parseInt(""+val); }
        toString() { return ""+this.value; }
    }

    class mxIntList extends mxData
    {
        #value;

        constructor(name)
        {
            super(name);
            this.#value = [];
        }

        isContainer() { return true; }
        get count() { return this.#value.length; }
        get value() { return this.count ? this.#value[0] : null; }
        getValue(i) { return i < this.count ? this.#value[i] : null; }
        push(value) { this.#value.push( parseInt(""+value)); }
        toString() { return ""+this.value.join(","); }
    }

    class mxFloat extends mxData
    {
        #value;

        constructor(name, val)
        {
            super(name);
            this.#value = parseFloat(""+val);
        }

        get value() { return this.#value; }
        set value(val) { this.#value = parseFloat(""+val); }
        toString() { return ""+this.value; }
    }

    class mxFloatList extends mxData
    {
        #value;

        constructor(name)
        {
            super(name);
            this.#value = [];
        }

        isContainer() { return true; }
        get count() { return this.#value.length; }
        get value() { return this.count ? this.#value[0] : null; }
        getValue(i) { return i < this.count ? this.#value[i] : null; }
        push(value) { this.#value.push( parseFloat(""+value)); }
        toString() { return ""+this.value.join(","); }
    }

    class mxString extends mxData
    {
        #value;

        constructor(name, val)
        {
            super(name);
            this.#value = ""+val;
        }

        get value() { return this.#value; }
        set value(val) { this.#value = ""+val; }
        toString() { return this.value; }
    }

    class mxStringList extends mxData
    {
        #value;

        constructor(name)
        {
            super(name);
            this.#value = [];
        }

        isContainer() { return true; }
        get count() { return this.#value.length; }
        get value() { return this.count ? this.#value[0] : null; }
        getValue(i) { return i < this.count ? this.#value[i] : null; }
        push(value) { this.#value.push( ""+value); }
        toString() { return ""+this.value.join(","); }
    }

    class DataSource
    {
        #publicList;

        constructor()
        {
            this.#publicList = [];
        }

        get numPublics() { return this.#publicList.length; }

        getPublicByIndex(i) { return this.#publicList[i]; }

        getPublic(name)
        {
            for (let i in this.#publicList)
            {
                if (this.#publicList[i].name == name) return this.#publicList[i];
            }
            return null;
        }

        clearPublicList() { this.#publicList = []; }

        publish(data) { this.#publicList.push(data); }

        unpublish() 
        {
            for (let i in this.#publicList)
            {
                this.#publicList[i].setToDefault();
            }
        }

        remove(name)
        {
            let i = this.#publicList.findIndex(data => data.name == name);
            if (i > -1) 
            {
                this.#publicList[i].setToDefault();
                this.#publicList.splice(i,1);
            }
        }
    }

    class DataWrapper
    {
        #data;
        #name;
        #index;

        constructor(name, data)
        {
            this.#index = 0;
            this.#name = name;
            this.#data = data;
        }

        setData(data) 
        { 
            this.#data.wrapper = null;
            this.#data = data; 
            data.wrapper = this;
        }
        get name() { return this.#name; }
        get data() { return this.#data; }
        get count() { return this.#data.count; }

        setToDefault()
        {
            if (this.#data) this.#data.wrapper = null;
            this.#data = mx.DataLibrary.getDefault(this.#name);
        }

        reset() { this.#index = 0; }

        get value() 
        {
            let val = this.#data.getValue(this.#index);
            if (this.#data.isContainer()) this.#advanceIndex();
            return val;
        }

        #advanceIndex()
        {
            this.#index += 1;
            if (this.#index == this.count) this.reset();
        }
    }

    class DataLibrary
    {
        #publics;
        #defaults;
        #emptyDefault;

        constructor()
        {
            this.#publics = {};
            this.#defaults = {};
            this.#emptyDefault = new mxString("default", "");
        }

        getDefault(name)
        {
            if (name in this.#defaults) return this.#defaults[name];
            return this.#emptyDefault;
        }

        setDefault(data)
        {
            this.#defaults[data.name] = data;
        }

        publish(source)
        {
            for (let i=0; i < source.numPublics; ++i)
            {
                let data = source.getPublicByIndex(i);
                let wrapper = null;

                if (data.name in this.#publics) wrapper = this.#publics[data.name];
                if (wrapper)
                {
                    wrapper.setData(data);
                }
                else
                {
                    wrapper = new DataWrapper(data.name, data);
                    data.wrapper = wrapper;
                    this.#publics[wrapper.name] = wrapper;
                }
            }
        }

        getData(name)
        {
            let ret = null;

            if (name in this.#publics) ret = this.#publics[name];
            if (ret != null) return ret;
      
            let data = null;
            if (name in this.#defaults) data = this.#defaults[name];
            if (data == null) return ret;
      
            ret = new DataWrapper(data.name, data);
            data.wrapper = ret;
            this.#publics[ret.name] = ret;
      
            return ret;
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