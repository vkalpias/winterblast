pc.script.attribute('speed', 'number', 5);
pc.script.attribute('xp', 'number', 10);
pc.script.attribute('damage', 'number', 0.10);

pc.script.create('enemy_diagonal', function (context) {
    var dir = new pc.Vec3();
    var quat = new pc.Quat();
    var temp = new pc.Vec3();
    
    // Creates a new Enemy_diagonal instance
    var Enemy_diagonal = function (entity) {
        this.entity = entity;
        this.entity.isEnemy = true;
        this.entity.getXp = function () {
            return this.xp;
        }.bind(this);
        this.modelEntity = null;
        this.currentCorner = -1;
    };

    Enemy_diagonal.prototype = {
        initialize: function () {
            this.entity.collision.on('collisionstart', this.onCollision, this);
            this.modelEntity = this.entity.findByName('model');
            this.entity.script.steer.velocityCalculator = this;
        },
        
        // Called every frame, dt is time in seconds since last update
        calculateVelocity: function (dt) {
            var pos = this.entity.getPosition();
            
            var offset = 3;
            
            var ll = game.getLimitLeft() + offset;
            var lt = game.getLimitTop() + offset;
            var lr = game.getLimitRight() - offset;
            var lb = game.getLimitBottom() - offset;
            if (this.currentCorner < 0) {
                this.currentCorner = Math.floor(pc.math.random(0, 4));
            }
            
            var x, z;
            
            switch (this.currentCorner) {
                // top left
                case 0:   
                    x = ll;
                    z = lt;
                    break;
                // top right
                case 1:   
                    x = lr;
                    z = lt;
                    break;
                // bottom right
                case 2:   
                    x = lr;
                    z = lb;
                    break;
                // bottom left
                case 3:   
                    x = ll;
                    z = lb;
                    break;
            }
            
            temp.set(x, 0, z);
            dir.sub2(temp, pos)
            var len = dir.length();
            if (len < 2) {
                this.currentCorner = (this.currentCorner + 2) % 4;
            } 
            
            return dir.scale(this.speed / len);
        },
        
        onCollision: function (result) {
            if (result.other === game.player) {
                game.player.script.player.addLife(-this.damage);
            }
        }
    };

    return Enemy_diagonal;
});