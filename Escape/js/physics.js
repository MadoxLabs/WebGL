importScripts('cannon.js');

var world;
var live = false;

self.onmessage = function (e)
{
  if (e.data.near)
  {
    var obj = new CANNON.RaycastResult();
    world.rayTest(e.data.near, e.data.far, obj);
    self.postMessage({ hit: obj.body.name });

    obj.body.wakeUp();
    obj.body.applyForce(obj.hitNormalWorld.scale(-200 * obj.body.mass), obj.hitPointWorld);
    return;
  }

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
    world.defaultContactMaterial.contactEquationRegularization = 4;
    world.defaultContactMaterial.friction = 1.0;
    world.defaultContactMaterial.restitution = 0;
    world.defaultContactMaterial.frictionEquationStiffness = 1e9;
    world.defaultContactMaterial.frictionEquationRegularization = 4;

    // Ground plane
    var plane = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(plane);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.type = CANNON.Body.STATIC;
    groundBody.name = "ground";
    world.add(groundBody);

    // furniture
    var table = new CANNON.Body({ mass: 10 });
    table.addShape(new CANNON.Box(new CANNON.Vec3(2.0, 1.5, 1.0)));
    table.position.set(0.0, 1.5, 3.0);
    table.type = CANNON.Body.KINEMATIC;
    table.name = "table";
    world.add(table);

    var shelf = new CANNON.Body({ mass: 10 });
    shelf.addShape(new CANNON.Box(new CANNON.Vec3(0.75, 0.05, 2.0)));
    shelf.position.set(-3.25, 4.5, 0.0);
    shelf.type = CANNON.Body.KINEMATIC;
    shelf.name = "shelf";
    world.add(shelf);

    var clock = new CANNON.Body({ mass: 20 });
    clock.addShape(new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.5)));
    clock.position.set(-3.5, 4.8, 0.0);
    clock.name = "clock";
    world.add(clock);

    var dresser = new CANNON.Body({ mass: 10 });
    dresser.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 1.6, 1.5)));
    dresser.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
    dresser.position.set(3.4, 1.5835, 0.0);
    dresser.type = CANNON.Body.KINEMATIC;
    dresser.name = "dresser";
    world.add(dresser);

    var drawer = new CANNON.Body({ mass: 10 });
    drawer.addShape(new CANNON.Box(new CANNON.Vec3(0.472, 0.4, 1.25)));
    drawer.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
    drawer.position.set(3.2, 2.65, 0.0);
    drawer.type = CANNON.Body.KINEMATIC;
    drawer.name = "drawer";
    world.add(drawer);

    var shape = new CANNON.Box(new CANNON.Vec3(0.166 / 2.0, 0.083 / 2.0, 0.498 / 2.0));
    var angle = 0;
    for (var layer = 0; layer < 20; ++layer)
    {
      angle += Math.PI / 2.0;
      for (var piece = 0; piece < 3; ++piece)
      {
        var body = new CANNON.Body({ mass: 1 });
        body.addShape(shape);
        if (layer % 2) body.position.set((Math.random() * 0.01) + 0.166 * piece, (Math.random() * 0.01) + 0.080 * layer + 3.0, 0.0 + 2.5);
        else body.position.set((Math.random() * 0.01) + 0.166, (Math.random() * 0.01) + 0.080 * layer + 3.0, 0.166 * piece - 0.166 + 2.5);
        body.quaternion.setFromEuler(0, angle, 0);
        body.name = "jenga";
        world.add(body);
        body.sleep();
      }
    }

    // walls
    var wallbox = new CANNON.Box(new CANNON.Vec3(4.0,4.0, 0.1));
    var wall = new CANNON.Body({ mass: 1000000 });
    wall.addShape(wallbox);
    wall.position.set(0.0, 4.0, 4.0);
    wall.type = CANNON.Body.STATIC;
    wall.name = "wall";
    world.add(wall);

    wall = new CANNON.Body({ mass: 1000000 });
    wall.addShape(wallbox);
    wall.position.set(0.0, 4.0, -4.0);
    wall.type = CANNON.Body.STATIC;
    wall.name = "wall";
    world.add(wall);

    wall = new CANNON.Body({ mass: 1000000 });
    wall.addShape(wallbox);
    wall.position.set(-4.0, 4.0, 0.0);
    wall.quaternion.setFromEuler(0, Math.PI/2.0, 0);
    wall.type = CANNON.Body.STATIC;
    wall.name = "wall";
    world.add(wall);

    wall = new CANNON.Body({ mass: 1000000 });
    wall.addShape(wallbox);
    wall.position.set(4.0, 4.0, 0.0);
    wall.quaternion.setFromEuler(0, Math.PI / -2.0, 0);
    wall.type = CANNON.Body.STATIC;
    wall.name = "wall";
    world.add(wall);
  }

//  if (e.data.live && !live)
//  {
//    live = true;
//    for (var i = 0; i !== world.bodies.length; i++)
//      if (world.bodies[i].sleepState) world.bodies[i].wakeUp();
//  }

  // Step the world
  world.step(e.data.dt);

  // Copy over the data to the buffers
  var positions = e.data.positions;
  var quaternions = e.data.quaternions;
  var bounds = e.data.bounds;
  for (var i = 0, j = 0; i !== world.bodies.length; i++)
  {
    var b = world.bodies[i],
        p = b.position,
        q = b.quaternion;
    if (b.shapes[0].type == 2) continue;
    positions[3 * j + 0] = p.x;
    positions[3 * j + 1] = p.y;
    positions[3 * j + 2] = p.z;
    quaternions[4 * j + 0] = q.x;
    quaternions[4 * j + 1] = q.y;
    quaternions[4 * j + 2] = q.z;
    quaternions[4 * j + 3] = q.w;
    bounds[6 * j + 0] = b.aabb.lowerBound.x;
    bounds[6 * j + 1] = b.aabb.lowerBound.y;
    bounds[6 * j + 2] = b.aabb.lowerBound.z;
    bounds[6 * j + 3] = b.aabb.upperBound.x;
    bounds[6 * j + 4] = b.aabb.upperBound.y;
    bounds[6 * j + 5] = b.aabb.upperBound.z;
    ++j;
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