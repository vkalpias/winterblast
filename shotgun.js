pc.script.attribute('rate', 'number', 1);
pc.script.attribute('bulletSpeed', 'number', 20);
pc.script.attribute('numBullets', 'number', 3);
pc.script.attribute('spread', 'number', 1);

pc.script.create('shotgun', function (context) {
    var temp = new pc.Vec3();
    var temp2 = new pc.Vec3();
    
    // Creates a new Shotgun instance
    var Shotgun = function (entity) {
        this.entity = entity;
    };

    Shotgun.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.releasedTimer = new Timer(this.rate, true);
            this.releasedTimer.on('finish', function () {
                this.heldTimer.reset();
            }.bind(this));
            
            this.heldTimer = new Timer(this.rate, true);
            this.heldTimer.on('finish', this.shoot, this);
            
            this.forward = this.entity.findByName('forward');
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
            temp.normalize();
            this.entity.lookAt(temp.add(this.entity.getPosition()));
            
            var angles = this.forward.getLocalEulerAngles();
            angles.y = Math.floor(this.numBullets * 0.5) * (-this.spread);
            this.forward.setLocalEulerAngles(angles);
            
            for (var i=0; i<this.numBullets; i++) {
                temp.copy(this.forward.forward);
                
                var bullet = game.prefabs.spawn('bullet', context.root);
                bullet.setPosition(this.entity.getPosition());
                temp.scale(this.bulletSpeed);
                bullet.script.bullet.setVelocity(temp);        
                bullet.lookAt(temp.add(this.entity.getPosition()));
                
                angles.y += this.spread;
                this.forward.setLocalEulerAngles(angles);
            }
            
            game.player.fire('shoot');
        }
    };

    return Shotgun;
});