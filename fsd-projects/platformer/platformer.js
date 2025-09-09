$(function () {
  // initialize canvas and context when able to
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("load", loadJson);

  function setup() {
    if (firstTimeSetup) {
      halleImage = document.getElementById("player");
      projectileImage = document.getElementById("projectile");
      cannonImage = document.getElementById("cannon");
      $(document).on("keydown", handleKeyDown);
      $(document).on("keyup", handleKeyUp);
      firstTimeSetup = false;
      //start game
      setInterval(main, 1000 / frameRate);
    }

    // Create walls - do not delete or modify this code
    createPlatform(-50, -50, canvas.width + 100, 50); // top wall
    createPlatform(-50, canvas.height - 10, canvas.width + 100, 200, "black"); // bottom wall
    createPlatform(-50, -50, 50, canvas.height + 500); // left wall
    createPlatform(canvas.width, -50, 50, canvas.height + 100); // right wall

    //////////////////////////////////
    // ONLY CHANGE BELOW THIS POINT //
    //////////////////////////////////

    // TODO 1 - Enable the Grid
   toggleGrid();


    // TODO 2 - Create Platforms
   createPlatform(0,690,150,40, "#000000ff"),
   createPlatform(150,550,45,180, "#000000ff"),
   createPlatform(85,600,80,40, "#000000ff"),
  createPlatform(0,470,75,40, "#000000ff"),
  createPlatform(150,300,45,250, "#000000ff"),
  createPlatform(85,340,80,40, "#000000ff"),
  createPlatform(150,200,45,180, "black")
  createPlatform(0,205,80,40, "black")
  createPlatform(150,200,140,40, "black")
  createPlatform(625,200,140,40, "#000000ff")
  createPlatform(300, 200, 210, 40, "black", 300, 400, 1)
  createPlatform(800,250,140,40)
  createPlatform(970,320,140,40)




    // TODO 3 - Create Collectables
  createCollectable("gojo",20,650)
  createCollectable("shoko",380,215)
  
  


    
    // TODO 4 - Create Cannons
   createCannon("bottom", 250, 2000)

   
    
    
    //////////////////////////////////
    // ONLY CHANGE ABOVE THIS POINT //
    //////////////////////////////////
  }

  registerSetup(setup);
});
