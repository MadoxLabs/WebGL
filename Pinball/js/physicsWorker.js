importScripts('lib/cannon.js');

var world;

self.onmessage = function (e)
{
  if (!world)
  {
    // Init physics
    world = new CANNON.World();
    world.allowSleep = true;
    world.broadphase = new CANNON.NaiveBroadphase();
    world.broadphase.useBoundingBoxes = true;
    world.gravity.set(2, -7, 0);
    var solver = new CANNON.GSSolver();
    solver.iterations = 15;
    solver.tolerance = 0.001;
    world.solver = solver;
//    world.defaultContactMaterial.contactEquationStiffness = 1e9;
//    world.defaultContactMaterial.contactEquationRegularization = 4;
    world.defaultContactMaterial.friction = 0.5;
    world.defaultContactMaterial.restitution = 0.5;
//    world.defaultContactMaterial.frictionEquationStiffness = 1e9;
//    world.defaultContactMaterial.frictionEquationRegularization = 4;

    // Ground plane
    var plane = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(plane);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.type = CANNON.Body.STATIC;
    groundBody.name = "ground";
    world.add(groundBody);

    for (var i = 1; i < 6; ++i)
    {
      var ball = new CANNON.Body({ mass: 1 });
      ball.addShape(new CANNON.Sphere(0.1));
      ball.position.set(-3.0, 0.2, 1.8 - 0.6*i);
      ball.name = "ball"+i;
      world.add(ball);
    }

    var wall1 = new CANNON.Body({ mass: 20 });
    wall1.addShape(new CANNON.Box(new CANNON.Vec3(0.228 / 2, 0.1, 1.78 / 2)));
    wall1.type = CANNON.Body.KINEMATIC;
    wall1.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 4);
    wall1.position.set(1.71, 0.1, 1.4);
    wall1.name = "wall1";
    world.add(wall1);

    var wall2 = new CANNON.Body({ mass: 20 });
    wall2.addShape(new CANNON.Box(new CANNON.Vec3(0.228 / 2, 0.1, 1.78 / 2)));
    wall2.type = CANNON.Body.KINEMATIC;
    wall2.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 4);
    wall2.position.set(1.71, 0.1, -1.4);
    wall2.name = "wall2";
    world.add(wall2);

    var wall3 = new CANNON.Body({ mass: 20 });
    wall3.addShape(new CANNON.Box(new CANNON.Vec3(0.228 / 2, 0.1, 1.78 / 2)));
    wall3.type = CANNON.Body.KINEMATIC;
    wall3.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    wall3.position.set(0.2, 0.1, -2.05);
    wall3.name = "wall3";
    world.add(wall3);

    var wall4 = new CANNON.Body({ mass: 20 });
    wall4.addShape(new CANNON.Box(new CANNON.Vec3(0.228 / 2, 0.1, 1.78 / 2)));
    wall4.type = CANNON.Body.KINEMATIC;
    wall4.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    wall4.position.set(0.2, 0.1, 2.05);
    wall4.name = "wall4";
    world.add(wall4);

    var bumper1 = new CANNON.Body({ mass: 20 });
    bumper1.addShape(new CANNON.Cylinder(1.0, 1.0, 0.2, 20));
    bumper1.type = CANNON.Body.KINEMATIC;
    bumper1.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    bumper1.position.set(-1.0, 0.1, 0.0);
    bumper1.name = "bumper1";
    world.add(bumper1);

    var bumper2 = new CANNON.Body({ mass: 20 });
    bumper2.addShape(new CANNON.Cylinder(0.3, 0.3, 0.2, 20));
    bumper2.type = CANNON.Body.KINEMATIC;
    bumper2.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    bumper2.position.set(1.0, 0.1, -1.0);
    bumper2.name = "bumper2";
    world.add(bumper2);

    var bumper3 = new CANNON.Body({ mass: 20 });
    bumper3.addShape(new CANNON.Cylinder(0.3, 0.3, 0.2, 20));
    bumper3.type = CANNON.Body.KINEMATIC;
    bumper3.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    bumper3.position.set(1.0, 0.1, 1.0);
    bumper3.name = "bumper3";
    world.add(bumper3);
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
    if (b.aabbNeedsUpdate)  b.computeAABB();
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