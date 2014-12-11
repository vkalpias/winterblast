pc.script.attribute('rate', 'number', 1);
pc.script.attribute('bulletSpeed', 'number', 20);

pc.script.create('snow_pistol', function (context) {
    var temp = new pc.Vec3();
    
    // Creates a new Snow_pistol instance
    var Snow_pistol = function (entity) {
        this.entity = entity;
        this.heldTimer = null;
        this.releasedTimer = null
    };

    Snow_pistol.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.releasedTimer = new Timer(this.rate, true);
            this.releasedTimer.on('finish', function () {
                this.heldTimer.reset();
            }.bind(this));
            
            this.heldTimer = new Timer(this.rate, true);
            this.heldTimer.on('finish', this.shoot, this);
        },
        
        onDisable: function () {
            this.releasedTimer.reset();
            this.heldTimer.reset();
        },
        
        onAttributeChanged: function (name, oldValue, newValue) {
            if (name === 'rate') {
                this.heldTimer.rate = newValue;      
                this.releasedTimer.rate = newValue;
            }
        },

        handleInput: function (dt) {
            if (context.mouse.isPressed(pc.input.MOUSEBUTTON_LEFT)) {
                this.heldTimer.tick(dt);
            } else {
                this.releasedTimer.tick(dt);
            }
        },
        
        shoot: function () {
            temp.sub2(game.cursor.script.cursor.getAimPosition(), this.entity.getPosition());
            temp.y = 0;
            temp.normalize().scale(this.bulletSpeed);
            
            var bullet = game.prefabs.spawn('bullet', context.root);
            bullet.setPosition(this.entity.getPosition());
            bullet.lookAt(temp.add(this.entity.getPosition()));
            bullet.script.bullet.setVelocity(temp);
            
            game.player.fire('shoot');
        }
    };

    return Snow_pistol;
});