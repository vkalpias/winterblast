pc.script.attribute('speed', 'number', 2);
pc.script.attribute('xp', 'number', 5);
pc.script.attribute('damage', 'number', 0.05);

pc.script.create('enemy_follow', function (context) {
    var dir = new pc.Vec3();
    var quat = new pc.Quat();
    var temp = new pc.Vec3();
    
    // Creates a new Enemy_follow instance
    var Enemy_follow = function (entity) {
        this.entity = entity;
        this.entity.isEnemy = true;
        this.entity.getXp = function () {
            return this.xp;
        }.bind(this);
        this.modelEntity = null;
    };

    Enemy_follow.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.entity.collision.on('collisionstart', this.onCollision, this);
            this.modelEntity = this.entity.findByName('model');
            this.entity.script.steer.velocityCalculator = this;
        },
        
        // Called every frame, dt is time in seconds since last update
        calculateVelocity: function (dt) {
            var pos = this.entity.getPosition();
            var target = game.player.getPosition();
            dir.sub2(target, pos).normalize();
            
            var vel = dir.scale(this.speed);
            return vel;
        },
        
        onCollision: function (result) {
            if (result.other === game.player) {
                game.player.script.player.addLife(-this.damage);
            }
        }
    };

    return Enemy_follow;
});