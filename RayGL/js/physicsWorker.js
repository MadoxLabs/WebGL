importScripts('cannon.js');

var world = null;

self.onmessage = function (e)
{
  if (!world)
  {
    // Init physics
    world = new CANNON.World();
    world.allowSleep = true;
    world.broadphase = new CANNON.NaiveBroadphase();
    world.broadphase.useBoundingBoxes = true;
    world.gravity.set(0, -10, 0);
    var solver = new CANNON.GSSolver();
    solver.iterations = 15;
    solver.tolerance = 0.01;
    world.solver = solver;
    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRegularization = 4;
    world.defaultContactMaterial.friction = 1.0;
    world.defaultContactMaterial.restitution = 0;
    world.defaultContactMaterial.frictionEquationStiffness = 1e9;
    world.defaultContactMaterial.frictionEquationRegularization = 4;

    // Ground plane
    var groundMaterial = new CANNON.Material();
    var plane = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
    groundBody.addShape(plane);
    groundBody.position.set(0,-3,0);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.type = CANNON.Body.STATIC;
    groundBody.name = "ground";
    world.add(groundBody);

    var mat1 = new CANNON.Material();
    var shape = new CANNON.Sphere(0.5);
    var angle = 0;
    for (var layer = 0; layer < 20; ++layer)
    {
        var body = new CANNON.Body({ mass: 1, material: mat1 });
        body.addShape(shape);
        body.linearDamping = 0.1;
        let x = Math.random() * 10.0 - 5.0;
        let y = Math.random() * 10.0 + 1.0;
        let z = Math.random() * 20.0;
        body.position.set(x,y,z);
        body.quaternion.setFromEuler(0, angle, 0);
        body.name = "ball"+layer;
        world.add(body);
    }

    var mat1_ground = new CANNON.ContactMaterial(groundMaterial, mat1, { friction: 0.0, restitution: 0.9 });
    world.addContactMaterial(mat1_ground);
  }

  // Step the world
  world.step(e.data.dt);

  // Copy over the data to the buffers
  var positions = e.data.positions;
  for (var i = 1, j = 0; i < 21; i++)
  {
    var b = world.bodies[i],
      p = b.position;
    positions[3 * j + 0] = p.x;
    positions[3 * j + 1] = p.y;
    positions[3 * j + 2] = p.z;

    ++j;
  }

  // Send data back to the main thread
  self.postMessage({
    positions: positions,
  }, [positions.buffer]);
};