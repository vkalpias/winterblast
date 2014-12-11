pc.script.attribute('duration', 'number', 5);
pc.script.attribute('strength', 'number', 60);

pc.script.create('powerup_explosion', function (context) {
    // Creates a new Powerup_explosion instance
    var Powerup_explosion = function (entity) {
        this.entity = entity;
        this.timer = null;
        this.isExploding = false;
    };

    Powerup_explosion.prototype = {
        initialize: function () {
            this.entity.collision.on('triggerenter', this.onTrigger, this);            
            this.timer = new Timer(this.duration);
            this.timer.on('finish', function () {
                game.prefabs.destroy(this.entity);
            }.bind(this));
        },
        
        onEnable: function () {
            this.timer.reset();  
        },
        
        onTrigger: function (other) {
            if (other === game.player) {
                this.explode();
            }
        },
        
        explode: function () {
            var entity = this.entity;
            
            var count = 10;
            var pos = this.entity.getPosition();
            var mat = new pc.Mat4().setFromEulerAngles(0, 2 * Math.PI * pc.math.RAD_TO_DEG / count, 0);
            var forward = new pc.Vec3(0, 0, 1);
            var temp = new pc.Vec3();
            
            for (var i=0; i<count; i++) {
                mat.transformVector(forward, forward);
                var bullet = game.prefabs.spawn('bullet_explosion', context.root);
                temp.copy(pos).add(forward);
                bullet.setPosition(temp);
                bullet.lookAt(temp.add(forward));
                bullet.script.bullet.setVelocity(temp.copy(forward).scale(this.strength));
            }
            
            game.audio.play('explosion_powerup');
            game.prefabs.destroy(entity);
        },
        
        update: function (dt) {
            this.timer.tick(dt);
        }
    };

    return Powerup_explosion;
});
