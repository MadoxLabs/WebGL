importScripts('cannon.js');

var world;
self.onmessage = function (e)
{
  if (!world)
  {
    // Init physics
    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.gravity.set(0, -10, 0);
    var solver = new CANNON.GSSolver();
    solver.iterations = 7;
    solver.tolerance = 0.1;
    world.solver = solver;
    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRegularizationTime = 4;
    world.defaultContactMaterial.friction = 1.0;
    world.defaultContactMaterial.frictionEquationStiffness = 1e9;
    world.defaultContactMaterial.frictionEquationRegularizationTime = 4;
//    physicsMaterial = new CANNON.Material("woodMaterial");
//    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
//                                                            physicsMaterial,
//                                                            {
//                                                              friction: 40.0,
//                                                              restitution: 0.3,
//                                                              contactEquationStiffness: 1e9,
//                                                              contactEquationRelaxation: 4,
//                                                              frictionEquationStiffness: 1e9,
//                                                              frictionEquationRelaxation: 4
//                                                            }
//                                                            );
//    world.addContactMaterial(physicsContactMaterial);

    // Ground plane
    var plane = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(plane);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.add(groundBody);

    var shape = new CANNON.Box(new CANNON.Vec3(0.166 / 2.0, 0.083 / 2.0, 0.498 / 2.0));
    var angle = 0;
    for (var layer = 0; layer < 20; ++layer)
    {
      angle += Math.PI / 2.0;
      for (var piece = 0; piece < 3; ++piece)
      {
        var body = new CANNON.Body({ mass: 1});
        body.addShape(shape);
      //  body.linearDamping = 1;
      //  body.angularDamping = 1;;
        if (layer % 2) body.position.set(0.166 * piece, 0.083 * layer, 0.0);
        else body.position.set(0.166, 0.083 * layer, 0.166 * piece - 0.166);
        body.quaternion.setFromEuler(0, angle, 0);
        world.add(body);
      }
    }
  }

/*
  if (e.data.live)
  {
    for (var i = 0; i !== world.bodies.length-1; i++)
    {
      world.bodies[i + 1].mass = 1;
      world.bodies[i + 1].updateMassProperties();
    }
    var point = new CANNON.Vec3(0, 0, 0);
    var impulse = new CANNON.Vec3(20*1 / 60, 0, 0);
    world.bodies[2].applyImpulse(impulse, point);
  }*/

  // Step the world
  world.step(e.data.dt);

  // Copy over the data to the buffers
  var positions = e.data.positions;
  var quaternions = e.data.quaternions;
  for (var i = 0; i !== world.bodies.length-1; i++)
  {
    var b = world.bodies[i+1],
        p = b.position,
        q = b.quaternion;
    positions[3 * i + 0] = p.x;
    positions[3 * i + 1] = p.y;
    positions[3 * i + 2] = p.z;
    quaternions[4 * i + 0] = q.x;
    quaternions[4 * i + 1] = q.y;
    quaternions[4 * i + 2] = q.z;
    quaternions[4 * i + 3] = q.w;
  }

  // Send data back to the main thread
  self.postMessage({
    positions: positions,
    quaternions: quaternions
  }, [positions.buffer,
      quaternions.buffer]);
};