importScripts('cannon.js');

var world;

self.onmessage = function (e)
{
  if (e.data.near)
  {
    var obj = new CANNON.RaycastResult();
    world.rayTest(e.data.near, e.data.far, obj);
    self.postMessage({ hit: obj.body.name });

    var force = obj.body.name == "drawer" ? 200 : -200;
    obj.body.wakeUp();
    if (obj.body.name == "drawer") obj.body.type = CANNON.Body.DYNAMIC;
    if (obj.body.name == "lock") world.bodies[4].type = CANNON.Body.DYNAMIC;
    obj.body.applyForce(obj.hitNormalWorld.scale(force * obj.body.mass), obj.hitPointWorld);
    return;
  }

  if (e.data.setPosition)
  {
    world.bodies[e.data.id].position.set(e.data.setPosition[0], e.data.setPosition[1], e.data.setPosition[2]);
    return;
  }

  if (!world)
  {
    // Init physics
    world = new CANNON.World();
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

    var lightswitch = new CANNON.Body({ mass: 10 });
    lightswitch.addShape(new CANNON.Box(new CANNON.Vec3(0.25, 0.41, 0.066)));
    lightswitch.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    lightswitch.position.set(3.9, 4.5, 0.0);
    lightswitch.type = CANNON.Body.KINEMATIC;
    lightswitch.name = "lightswitch";
    world.add(lightswitch);

    var lockbox = new CANNON.Body({ mass: 10 });
    lockbox.addShape(new CANNON.Box(new CANNON.Vec3(0.5845, 0.5345, 0.3075)));
    lockbox.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    lockbox.position.set(3.4, 4.5, 0.0);
    lockbox.type = CANNON.Body.KINEMATIC;
    lockbox.name = "lockbox";
    world.add(lockbox);

    var lock = new CANNON.Body({ mass: 10 });
    lock.addShape(new CANNON.Box(new CANNON.Vec3(0.17, 0.17, 0.06)));
    lock.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    lock.position.set(3.9, 4.5, 0.8);
    lock.type = CANNON.Body.KINEMATIC;
    lock.name = "lock";
    world.add(lock);

    var clock = new CANNON.Body({ mass: 20 });
    clock.addShape(new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.5)));
    clock.position.set(-3.5, 4.8, 0.0);
    clock.name = "clock";
    world.add(clock);

    var dresser = new CANNON.Body({ mass: 10 });
    dresser.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.05, 1.5)));
    dresser.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 1.05, 1.5)), new CANNON.Vec3(0,-2.05,0));
    dresser.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
    dresser.position.set(3.35, 3.05, 0.0);
    dresser.type = CANNON.Body.KINEMATIC;
    dresser.name = "dresser";
    world.add(dresser);

    var drawer = new CANNON.Body({ mass: 10 });
    drawer.addShape(new CANNON.Box(new CANNON.Vec3(0.472, 0.05, 1.25)), new CANNON.Vec3(0, -0.35, 0));
    drawer.addShape(new CANNON.Box(new CANNON.Vec3(0.382, 0.4, 0.05)), new CANNON.Vec3(0, 0, 1.2));
    drawer.addShape(new CANNON.Box(new CANNON.Vec3(0.382, 0.4, 0.05)), new CANNON.Vec3(0, 0, -1.2));
    drawer.addShape(new CANNON.Box(new CANNON.Vec3(0.05, 0.4, 1.25)), new CANNON.Vec3(0.377, 0, 0));
    drawer.addShape(new CANNON.Box(new CANNON.Vec3(0.05, 0.4, 1.25)), new CANNON.Vec3(-0.377, 0, 0));
    drawer.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
    drawer.position.set(3.22, 2.57, 0.0);
    drawer.type = CANNON.Body.KINEMATIC;
    drawer.name = "drawer";
    world.add(drawer);

    var flashlight = new CANNON.Body({ mass: 2 });
    flashlight.addShape(new CANNON.Box(new CANNON.Vec3(0.6, 0.1, 0.1)));
    flashlight.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI/2);
    flashlight.position.set(2.95, 2.5, 0.0);
    flashlight.name = "flashlight";
    world.add(flashlight);

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
        body.name = "jenga"+(piece+layer*3);
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
    wall.name = "wall0";
    world.add(wall);

    wall = new CANNON.Body({ mass: 1000000 });
    wall.addShape(wallbox);
    wall.position.set(0.0, 4.0, -4.0);
    wall.type = CANNON.Body.STATIC;
    wall.name = "wall1";
    world.add(wall);

    wall = new CANNON.Body({ mass: 1000000 });
    wall.addShape(wallbox);
    wall.position.set(-4.0, 4.0, 0.0);
    wall.quaternion.setFromEuler(0, Math.PI/2.0, 0);
    wall.type = CANNON.Body.STATIC;
    wall.name = "wall2";
    world.add(wall);

    wall = new CANNON.Body({ mass: 1000000 });
    wall.addShape(wallbox);
    wall.position.set(4.0, 4.0, 0.0);
    wall.quaternion.setFromEuler(0, Math.PI / -2.0, 0);
    wall.type = CANNON.Body.STATIC;
    wall.name = "wall3";
    world.add(wall);
  }

  // Step the world
  world.step(e.data.dt);

  // Copy over the data to the buffers
  var names = [];
  var positions = e.data.positions;
  var quaternions = e.data.quaternions;
  var bounds = e.data.bounds;
  var boundslen = 0;
  for (var i = 0, j = 0; i !== world.bodies.length; i++)
  {
    var b = world.bodies[i],
        p = b.position,
        q = b.quaternion;
    //    if (b.shapes[0].type == CANNON.Body.STATIC) continue;
    if (b.aabbNeedsUpdate) b.computeAABB();
    names.push(b.name);
    positions[3 * j + 0] = p.x;
    positions[3 * j + 1] = p.y;
    positions[3 * j + 2] = p.z;
    quaternions[4 * j + 0] = q.x;
    quaternions[4 * j + 1] = q.y;
    quaternions[4 * j + 2] = q.z;
    quaternions[4 * j + 3] = q.w;

    for (var s = 0; s < b.shapes.length; ++s)
    {
      bounds[6 * boundslen + 0] = b.shapes[s].aabb.lowerBound.x;
      bounds[6 * boundslen + 1] = b.shapes[s].aabb.lowerBound.y;
      bounds[6 * boundslen + 2] = b.shapes[s].aabb.lowerBound.z;
      bounds[6 * boundslen + 3] = b.shapes[s].aabb.upperBound.x;
      bounds[6 * boundslen + 4] = b.shapes[s].aabb.upperBound.y;
      bounds[6 * boundslen + 5] = b.shapes[s].aabb.upperBound.z;
      boundslen++;
    }
    ++j;
  }

  // Send data back to the main thread
  self.postMessage({
    names: names,
    positions: positions,
    quaternions: quaternions,
    bounds: bounds,
    boundslen: boundslen
  }, [positions.buffer,
      quaternions.buffer,
      bounds.buffer]);
};