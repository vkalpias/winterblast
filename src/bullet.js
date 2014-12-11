pc.script.create('bullet', function (context) {
    var temp = new pc.Vec3();
    
    // Creates a new Bullet instance
    var Bullet = function (entity) {
        this.entity = entity;
        this.velocity = new pc.Vec3();
        this.lastPosition = new pc.Vec3();
    };

    Bullet.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            var pos = this.entity.getPosition();
            this.lastPosition.copy(pos);
            
            pos.x += this.velocity.x * dt;
            pos.y += this.velocity.y * dt;
            pos.z += this.velocity.z * dt;
            this.entity.setPosition(pos);
            
            if (!context.systems.rigidbody.raycastFirst(pos, this.lastPosition, this.onCollision.bind(this))) {
                temp.sub2(this.lastPosition, pos).normalize();
                temp.cross(temp, pc.Vec3.UP);
                temp.scale(0.5).add(this.lastPosition);
                if (!context.systems.rigidbody.raycastFirst(pos, temp, this.onCollision.bind(this))) {
                    temp.sub2(this.lastPosition, pos).normalize();
                    temp.cross(temp, pc.Vec3.DOWN);
                    temp.scale(0.5).add(this.lastPosition);
                    
                    context.systems.rigidbody.raycastFirst(pos, temp, this.onCollision.bind(this));
                }
            }
            
            if (!game.prefabs.isPrefab(this.entity) && !game.isPositionInLimits(this.entity.getPosition())) {
                game.prefabs.destroy(this.entity);
            }
        },
        
        onCollision: function (other) {
            if (other.isEnemy) {
                var effect = game.prefabs.spawn('vanish1', context.root);
                effect.setPosition(other.getPosition());
                effect.particlesystem.reset();
                effect.particlesystem.play();
                setTimeout(function () {
                     game.prefabs.destroy(effect);
                }, effect.particlesystem.lifetime * 1000);
                
                game.prefabs.destroy(other);
                game.prefabs.destroy(this.entity);
                
                game.onEnemyKilled(other.getXp());
            }
        },
        
        setVelocity: function (vel) {
            this.velocity.copy(vel);
        }
    };

    return Bullet;
});