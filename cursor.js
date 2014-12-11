pc.script.create('cursor', function (context) {
    var aim = new pc.Vec3();
    var dir = new pc.Vec3();
    
    // Creates a new Cursor instance
    var Cursor = function (entity) {
        this.entity = entity;
        this.camera = null;
        this.x = 0;
        this.y = 0;
        this.recordedX = 0;
        this.recordedY = 0;
    };

    Cursor.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.camera = context.root.findByName('camera').camera;
            this.groundPlane = new pc.shape.Plane(new pc.Vec3(), pc.Vec3.UP.clone());
            
            game.on('reset', this.reset, this);
            game.on('gameover', this.onGameover, this);
            
            // When the mouse button is clicked try and capture the pointer
            context.mouse.on('mousedown', function (e) {
                if (!pc.input.Mouse.isPointerLocked() && this.entity.enabled) {
                    context.mouse.enablePointerLock();
                    this.x = e.x;
                    this.y = e.y;
                }    
            }.bind(this));
            
            context.mouse.on('mousemove', function (e) {
                this.x += e.dx;
                this.y += e.dy;
                this.recordedX = e.x;
                this.recordedY = e.y;
            }.bind(this));
        },
        
        reset: function () {
            this.entity.enabled = true;  
            if (!pc.input.Mouse.isPointerLocked()) {
                context.mouse.enablePointerLock();
                this.x = this.recordedX;
                this.y = this.recordedY;
            } 
        },
        
        onGameover: function () {
            if (pc.input.Mouse.isPointerLocked()) {
                context.mouse.disablePointerLock();
            }
            
            this.entity.enabled = false;
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            var pos = this.entity.getPosition();
            
            this.camera.screenToWorld(this.x, this.y, this.camera.entity.getPosition().y, pos);
            this.entity.setPosition(pos);
        },
        
        getAimPosition: function (result) {
            if (!result) {
                result = aim;
            }
            
            var cameraPos = game.camera.getPosition();
            
            dir.sub2(cameraPos, this.entity.getPosition())
            .normalize()
            .scale(10000)
            .add(cameraPos);
            
            var t = this.groundPlane.intersect(cameraPos, dir);
            result.lerp(cameraPos, dir, t);
            
            return result;
        }
    };

    return Cursor;
});