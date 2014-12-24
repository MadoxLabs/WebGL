
JigLib.JOctree = function()
{
	this._cells = null; // OctreeCell
	this._vertices = null; // Vector3D
	this._triangles = null; // JIndexedTriangle
	this._boundingBox = null; // JAABox
	this._cellsToTest = null; // int
	this._testCounter = null; // int

		this._testCounter = 0;
		this._cells = [];
		this._vertices = [];
		this._triangles = [];
		this._cellsToTest = [];
		this._boundingBox = new JigLib.JAABox();
		
}

JigLib.JOctree.prototype.get_trianglesData = function()
{

		return this._triangles;
		
}

JigLib.JOctree.prototype.getTriangle = function(iTriangle)
{

		return this._triangles[iTriangle];
		
}

JigLib.JOctree.prototype.get_verticesData = function()
{

		return this._vertices;
		
}

JigLib.JOctree.prototype.getVertex = function(iVertex)
{

		return this._vertices[iVertex];
		
}

JigLib.JOctree.prototype.boundingBox = function()
{

		return this._boundingBox;
		
}

JigLib.JOctree.prototype.clear = function()
{

		this._cells.length=0;
		this._vertices.length=0;
		this._triangles.length=0;
		
}

JigLib.JOctree.prototype.addTriangles = function(vertices, numVertices, triangleVertexIndices, numTriangles)
{

		this.clear();
		
		this._vertices = vertices.concat();
		
		var NLen, tiny=JigLib.JMath3D.NUM_TINY;
		var i0, i1, i2;
		var dr1, dr2, N;
		var indexedTriangle;
		for (var triangleVertexIndices_i = 0, triangleVertexIndices_l = triangleVertexIndices.length, tri; (triangleVertexIndices_i < triangleVertexIndices_l) && (tri = triangleVertexIndices[triangleVertexIndices_i]); triangleVertexIndices_i++) {
			i0 = tri.i0;
			i1 = tri.i1;
			i2 = tri.i2;
			
			dr1 = vertices[i1].subtract(vertices[i0]);
			dr2 = vertices[i2].subtract(vertices[i0]);
			N = dr1.crossProduct(dr2);
			NLen = N.get_length();
			
			if (NLen > tiny)
			{
				indexedTriangle = new JigLib.JIndexedTriangle();
				indexedTriangle.setVertexIndices(i0, i1, i2, this._vertices);
				this._triangles.push(indexedTriangle);
			}
		}
		
}

JigLib.JOctree.prototype.buildOctree = function(maxTrianglesPerCell, minCellSize)
{

		this._boundingBox.clear();
		
		for (var _vertices_i = 0, _vertices_l = this._vertices.length, vt; (_vertices_i < _vertices_l) && (vt = this._vertices[_vertices_i]); _vertices_i++) {
			this._boundingBox.addPoint(vt);
		}
		
		this._cells.length=0;
		this._cells.push(new JigLib.OctreeCell(this._boundingBox));
		
		var numTriangles = this._triangles.length;
		for (var i = 0; i < numTriangles; i++ ) {
			this._cells[0].triangleIndices[i] = i;
		}
		
		var cellsToProcess = [];
		cellsToProcess.push(0);
		
		var iTri;
		var cellIndex;
		var childCell;
		while (cellsToProcess.length != 0) {
			cellIndex = cellsToProcess.pop();
			
			if (this._cells[cellIndex].triangleIndices.length <= maxTrianglesPerCell || this._cells[cellIndex].AABox.getRadiusAboutCentre() < minCellSize) {
				continue;
			}
			for (i = 0; i < JigLib.OctreeCell.NUM_CHILDREN; i++ ) {
				this._cells[cellIndex].childCellIndices[i] = this._cells.length;
				cellsToProcess.push(this._cells.length);
				this._cells.push(new JigLib.OctreeCell(this.createAABox(this._cells[cellIndex].AABox, i)));
				
				childCell = this._cells[this._cells.length - 1];
				numTriangles = this._cells[cellIndex].triangleIndices.length;
				for (var j=0; j < numTriangles; j++ ) {
				iTri = this._cells[cellIndex].triangleIndices[j];
				if (this.doesTriangleIntersectCell(this._triangles[iTri], childCell))
				{
					childCell.triangleIndices.push(iTri);
				}
				}
			}
			this._cells[cellIndex].triangleIndices.length=0;
		}
		
}

JigLib.JOctree.prototype.updateTriangles = function(vertices)
{

		this._vertices = vertices.concat();
		
		for (var _triangles_i = 0, _triangles_l = this._triangles.length, triangle; (_triangles_i < _triangles_l) && (triangle = this._triangles[_triangles_i]); _triangles_i++){
			triangle.updateVertexIndices(this._vertices);
		}
		
}

JigLib.JOctree.prototype.getTrianglesIntersectingtAABox = function(triangles, aabb)
{

		if (this._cells.length == 0) return 0;
		
		this._cellsToTest.length=0;
		this._cellsToTest.push(0);
		
		this.incrementTestCounter();
		
		var cellIndex, nTris, cell, triangle;
		
		while (this._cellsToTest.length != 0) {
			cellIndex = this._cellsToTest.pop();
			
			cell = this._cells[cellIndex];
			
			if (!aabb.overlapTest(cell.AABox)) {
				continue;
			}
			
			if (cell.isLeaf()) {
				nTris = cell.triangleIndices.length;
				for (var i = 0 ; i < nTris ; i++) {
				triangle = this.getTriangle(cell.triangleIndices[i]);
				if (triangle.counter != this._testCounter) {
					triangle.counter = this._testCounter;
					if (aabb.overlapTest(triangle.get_boundingBox())) {
						triangles.push(cell.triangleIndices[i]);
					}
				}
				}
			}else {
				for (i = 0 ; i < JigLib.OctreeCell.NUM_CHILDREN ; i++) {
				this._cellsToTest.push(cell.childCellIndices[i]);
				}
			}
		}
		return triangles.length;
		
}

JigLib.JOctree.prototype.dumpStats = function()
{

		var maxTris = 0, numTris, cellIndex, cell;
		
		var cellsToProcess = [];
		cellsToProcess.push(0);
		
		while (cellsToProcess.length != 0) {
			cellIndex = cellsToProcess.pop();
			
			cell = cell[cellIndex];
			if (cell.isLeaf()) {
				
				numTris = cell.triangleIndices.length;
				if (numTris > maxTris) {
				maxTris = numTris;
				}
			}else {
				for (var i = 0 ; i < JigLib.OctreeCell.NUM_CHILDREN ; i++) {
				if ((cell.childCellIndices[i] >= 0) && (cell.childCellIndices[i] < this._cells.length)) {
					cellsToProcess.push(cell.childCellIndices[i]);
				}
				}
			}
		}
		
}

JigLib.JOctree.prototype.createAABox = function(aabb, _id)
{

		var dims = JigLib.JNumber3D.getScaleVector(aabb.maxPos.subtract(aabb.minPos), 0.5);
		var offset;
		switch(_id) {
			case 0:
				offset = new JigLib.Vector3D(1, 1, 1);
				break;
			case 1:
				offset = new JigLib.Vector3D(1, 1, 0);
				break;
			case 2:
				offset = new JigLib.Vector3D(1, 0, 1);
				break;
			case 3:
				offset = new JigLib.Vector3D(1, 0, 0);
				break;
			case 4:
				offset = new JigLib.Vector3D(0, 1, 1);
				break;
			case 5:
				offset = new JigLib.Vector3D(0, 1, 0);
				break;
			case 6:
				offset = new JigLib.Vector3D(0, 0, 1);
				break;
			case 7:
				offset = new JigLib.Vector3D(0, 0, 0);
				break;
			default:
				offset = new JigLib.Vector3D(0, 0, 0);
				break;
		}
		
		var result = new JigLib.JAABox();
		result.minPos = aabb.minPos.add(new JigLib.Vector3D(offset.x * dims.x, offset.y * dims.y, offset.z * dims.z));
		result.maxPos = result.minPos.add(dims);
		
		dims.scaleBy(0.00001);
		result.minPos = result.minPos.subtract(dims);
		result.maxPos = result.maxPos.add(dims);
		
		return result;
		
}

JigLib.JOctree.prototype.doesTriangleIntersectCell = function(triangle, cell)
{

		if (!triangle.get_boundingBox().overlapTest(cell.AABox)) {
			return false;
		}
		if (cell.AABox.isPointInside(this.getVertex(triangle.getVertexIndex(0))) ||
		    cell.AABox.isPointInside(this.getVertex(triangle.getVertexIndex(1))) ||
		    cell.AABox.isPointInside(this.getVertex(triangle.getVertexIndex(2)))) {
				return true;
			}
			
		var tri = new JigLib.JTriangle(this.getVertex(triangle.getVertexIndex(0)), this.getVertex(triangle.getVertexIndex(1)), this.getVertex(triangle.getVertexIndex(2)));
		var edge;
		var seg;
		var edges = cell.get_egdes();
		var pts = cell.get_points();
		for (var i = 0; i < 12; i++ ) {
			edge = edges[i];
			seg = new JigLib.JSegment(pts[edge.ind0], pts[edge.ind1].subtract(pts[edge.ind0]));
			if (tri.segmentTriangleIntersection(null, seg)) {
				return true;
			}
		}
		
		var pt0;
		var pt1;
		for (i = 0; i < 3; i++ ) {
			pt0 = tri.getVertex(i);
			pt1 = tri.getVertex((i + 1) % 3);
			if (cell.AABox.segmentAABoxOverlap(new JigLib.JSegment(pt0, pt1.subtract(pt0)))) {
				return true;
			}
		}
		return false;
		
}

JigLib.JOctree.prototype.incrementTestCounter = function()
{

		++this._testCounter;
		if (this._testCounter == 0) {
			var numTriangles = this._triangles.length;
			for (var i = 0; i < numTriangles; i++) {
				this._triangles[i].counter = 0;
			}
			this._testCounter = 1;
		}
		
}



