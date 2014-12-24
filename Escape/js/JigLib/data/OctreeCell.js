
JigLib.OctreeCell = function(aabox)
{
	this.childCellIndices = null; // int
	this.triangleIndices = null; // int
	this.AABox = null; // JAABox
	this._points = null; // Vector3D
	this._egdes = null; // EdgeData

		this.childCellIndices = [];
		this.triangleIndices = [];
		
		this.clear();
		
		if(aabox){
			this.AABox = aabox.clone();
		}else {
			this.AABox = new JigLib.JAABox();
		}
		this._points = this.AABox.getAllPoints();
		this._egdes = this.AABox.get_edges();
		
}

JigLib.OctreeCell.prototype.isLeaf = function()
{

		return this.childCellIndices[0] == -1;
		
}

JigLib.OctreeCell.prototype.clear = function()
{

		for (var i = 0; i < JigLib.OctreeCell.NUM_CHILDREN; i++ ) {
			this.childCellIndices[i] = -1;
		}
		this.triangleIndices.splice(0, this.triangleIndices.length);
		
}

JigLib.OctreeCell.prototype.get_points = function()
{

		return this._points;
		
}

JigLib.OctreeCell.prototype.get_egdes = function()
{

		return this._egdes;
		
}

JigLib.OctreeCell.NUM_CHILDREN =  8; // uint


