pc.script.create('player', function (context) {
    // Creates a new Player instance
    var Player = function (entity) {
        this.entity = entity;
        this.activeWeapon = null;
        this.life = 1;
        this.initialPosition = new pc.Vec3();
        this.xp = 0;
        this.level = 1;
    };

    Player.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.initialPosition.copy(this.entity.getPosition());
            game.on('reset', this.reset, this);  
        },
        
        postInitialize: function () {
            this.reset();
        },
        
        reset: function () {
            this.entity.setPosition(this.initialPosition);
            this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
            this.entity.rigidbody.syncEntityToBody();
            
            this.xp = 0;
            this.level = 1;
            this.life = 1;
            
            this.setActiveWeapon('snow_pistol');
        },
        
        setActiveWeapon: function (name) {
            if (this.activeWeapon) {
                game.prefabs.destroy(this.activeWeapon.entity);
            }
            
            this.activeWeapon = game.prefabs.spawn(name, this.entity).script[name];
        },
        
        getActiveWeaponName: function () {
            if (this.activeWeapon) {
                return this.activeWeapon.entity.getName();
            }
            
            return null;
        },
        
        addLife: function (value) {
            this.life = pc.math.clamp(this.life + value, 0, 1);
            this.fire('life', this.life, value);
        },
        
        addXp: function (value) {
            this.xp = Math.max(this.xp + value, 0);
            var xpForCurLevel = game.levelToXp(this.level);
            var xpForNextLevel = game.levelToXp(this.level + 1);
            var progress = (this.xp - xpForCurLevel) / (xpForNextLevel - xpForCurLevel);
            if (progress == 1) {
                progress = 0; // 100% progress means next level
            }
            
            this.fire('xp', this.xp, progress);
            
            var level = game.xpToLevel(this.xp);
            if (level !== this.level) {
                this.setLevel(level);
            }
        },
        
        setLevel: function (value) {
            this.level = Math.max(value, 1);
            this.fire('level', this.level);
        }
        
    };

    return Player;
});