importScripts("JigLib/JigLib.js");  
importScripts("JigLib/geom/glMatrix.js");
importScripts("JigLib/geom/Vector3D.js");
importScripts("JigLib/geom/Matrix3D.js");
importScripts("JigLib/cof/JConfig.js");
importScripts("JigLib/vehicles/JCar.js");
importScripts("JigLib/vehicles/JWheel.js");
importScripts("JigLib/physics/RigidBody.js");
importScripts("JigLib/geometry/JBox.js");
importScripts("JigLib/vehicles/JChassis.js");
importScripts("JigLib/collision/CollDetectFunctor.js");
importScripts("JigLib/collision/CollDetectBoxPlane.js");
importScripts("JigLib/collision/CollDetectBoxMesh.js");
importScripts("JigLib/collision/CollDetectBoxBox.js");
importScripts("JigLib/collision/CollDetectSphereTerrain.js");
importScripts("JigLib/collision/CollDetectSphereBox.js");
importScripts("JigLib/collision/CollDetectCapsuleTerrain.js");
importScripts("JigLib/collision/CollDetectSphereCapsule.js");
importScripts("JigLib/collision/CollisionSystemAbstract.js");
importScripts("JigLib/collision/CollisionSystemBrute.js");
importScripts("JigLib/collision/CollDetectCapsuleBox.js");
importScripts("JigLib/collision/CollDetectSphereMesh.js");
importScripts("JigLib/collision/CollDetectBoxTerrain.js");
importScripts("JigLib/collision/CollisionSystemGrid.js");
importScripts("JigLib/collision/CollDetectCapsuleCapsule.js");
importScripts("JigLib/collision/CollPointInfo.js");
importScripts("JigLib/collision/CollisionInfo.js");
importScripts("JigLib/collision/CollDetectCapsulePlane.js");
importScripts("JigLib/collision/CollDetectInfo.js");
importScripts("JigLib/collision/CollDetectSphereSphere.js");
importScripts("JigLib/collision/CollisionSystemGridEntry.js");
importScripts("JigLib/collision/CollDetectSpherePlane.js");
importScripts("JigLib/math/JMatrix3D.js");
importScripts("JigLib/math/JMath3D.js");
importScripts("JigLib/math/JNumber3D.js");
importScripts("JigLib/geometry/JIndexedTriangle.js");
importScripts("JigLib/geometry/JOctree.js");
importScripts("JigLib/geometry/JCapsule.js");
importScripts("JigLib/geometry/JRay.js");
importScripts("JigLib/geometry/JAABox.js");
importScripts("JigLib/geometry/JTerrain.js");
importScripts("JigLib/geometry/JPlane.js");
importScripts("JigLib/geometry/JTriangleMesh.js");
importScripts("JigLib/geometry/JTriangle.js");
importScripts("JigLib/geometry/JSphere.js");
importScripts("JigLib/geometry/JSegment.js");
importScripts("JigLib/data/CollOutData.js");
importScripts("JigLib/data/ContactData.js");
importScripts("JigLib/data/PlaneData.js");
importScripts("JigLib/data/EdgeData.js");
importScripts("JigLib/data/TerrainData.js");
importScripts("JigLib/data/OctreeCell.js");
importScripts("JigLib/data/CollOutBodyData.js");
importScripts("JigLib/data/TriangleVertexIndices.js");
importScripts("JigLib/data/SpanData.js");
importScripts("JigLib/physics/constraint/JConstraint.js");
importScripts("JigLib/physics/constraint/JConstraintWorldPoint.js");
importScripts("JigLib/physics/constraint/JConstraintMaxDistance.js");
importScripts("JigLib/physics/constraint/JConstraintPoint.js");
importScripts("JigLib/physics/MaterialProperties.js");
importScripts("JigLib/physics/PhysicsController.js");
importScripts("JigLib/physics/CachedImpulse.js");
importScripts("JigLib/physics/PhysicsState.js");
importScripts("JigLib/physics/HingeJoint.js");
importScripts("JigLib/physics/BodyPair.js");
importScripts("JigLib/physics/PhysicsSystem.js");
importScripts("JigLib/debug/Stats.js");


var world;
var Vector3D = JigLib.Vector3D;

self.onmessage = function (e)
{
  if (!world)
  {
    // Init physics
    world = JigLib.PhysicsSystem.getInstance();
    world.setCollisionSystem(); // CollisionSystemBrute - pass true for CollisionSystemGrid
                                // system.setSolverType("FAST"); or "NORMAL"
    world.setSolverType("ACCUMULATED");
    world.setGravity(new Vector3D(0, -9.8, 0, 0));

    // Ground plane
    var ground = new JigLib.JPlane();
    ground.set_y(-1.50);
    ground.set_rotationX(90);
    ground.set_movable(false);
    world.addBody(ground);

    // table
    var table = new JigLib.JBox(null, 4, 2, 3);
    table.set_mass(10);
    table.moveTo(new Vector3D(0.0, 0.0, 0.0, 0.0));
    world.addBody(table);

    // jenga
    var angle = 0;
    for (var layer = 0; layer < 20; ++layer)
    {
      angle += Math.PI / 2.0;
      for (var piece = 0; piece < 3; ++piece)
      {
        var body = new JigLib.JBox(null, 0.166 / 2.0, 0.498 / 2.0, 0.083 / 2.0);
        body.set_mass(1);
        if (layer % 2) body.moveTo(new Vector3D(0.166 * piece, 0.080 * layer + 3.0, 0.0 ));
        else body.moveTo(new Vector3D(0.166, 0.080 * layer + 3.0, 0.166 * piece - 0.166 ));
        body.set_rotationY(angle);
        world.addBody(body);
      }
    }
  }

  // Step the world
  world.integrate(e.data.dt);

  // Copy over the data to the buffers
  var positions = e.data.positions;
  var quaternions = e.data.quaternions;
  var bounds = e.data.bounds;
  var mat = mat3.create();
  var q = quat4.create();

  for (var i = 0; i !== world._bodies.length-1; i++)
  {
    var b = world._bodies[i+1],
        p = b._currState.position,
        o = b._currState.orientation;
    positions[3 * i + 0] = p.x;
    positions[3 * i + 1] = p.y;
    positions[3 * i + 2] = p.z;

    mat3.fromMat4(mat, o._rawData);
    quat4.fromMat3(q, mat);

    quaternions[4 * i + 0] = q[0];
    quaternions[4 * i + 1] = q[1];
    quaternions[4 * i + 2] = q[2];
    quaternions[4 * i + 3] = q[3];
    bounds[6 * i + 0] = b._boundingBox.minPos.x;
    bounds[6 * i + 1] = b._boundingBox.minPos.y;
    bounds[6 * i + 2] = b._boundingBox.minPos.z;
    bounds[6 * i + 3] = b._boundingBox.maxPos.x;
    bounds[6 * i + 4] = b._boundingBox.maxPos.y;
    bounds[6 * i + 5] = b._boundingBox.maxPos.z;
  }
  
  // Send data back to the main thread
  self.postMessage({
    positions: positions,
    quaternions: quaternions,
    bounds: bounds
  }, [positions.buffer,
      quaternions.buffer,
      bounds.buffer]);
};