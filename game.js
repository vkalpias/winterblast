pc.script.attribute('waveStartTime', 'number', 5);
pc.script.attribute('healthRate', 'number', 3);
pc.script.attribute('explosionRate', 'number', 10);
pc.script.attribute('xpPerLevel', 'number', 100);
pc.script.attribute('xpPerLevelMultiplier', 'number', 2);
pc.script.attribute('shotgunRate', 'number', 5);
pc.script.attribute('shotgunLevel', 'number', 1);

pc.script.create('game', function (context) {
    var pos = new pc.Vec3();
    var ammoRayStart = new Ammo.btVector3();
    var ammoRayEnd = new Ammo.btVector3();
    
    // Creates a new Game instance
    var Game = function (entity) {
        this.entity = entity;
        
        this.prefabs = null;
        this.player = null;
        this.cursor = null;
        this.camera = null;
        this.waves = null;
        this.audio = null;
        
        this.healthTimer = null;
        this.explosionTimer = null;
        this.waveStartTimer = null;
        this.shotgunTimer = null;
        
        this.limitLeft = -24;
        this.limitRight = 24; 
        this.limitDown = 9;
        this.limitUp = -21;
        
        this.enemiesKilled = 0;
        this.enemiesSpawned = 0;
        this.waveStarted = false;
        this.currentWave = -1;
        this.totalTime = 0;
        
        this.isIntro = true;
        this.isOver = false;
        
        window.game = this;
    };

    Game.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.waveStartTimer = new Timer(this.waveStartTime);
            this.waveStartTimer.on('finish', this.startWave, this);
            this.waveStartTimer.on('second', function (remaining) {this.fire('nextWaveTimer', remaining)}, this);
            
            this.healthTimer = new Timer(this.healthRate);
            this.healthTimer.on('finish', function () {this.spawnPrefab('powerup_health')}, this);
            
            this.explosionTimer = new Timer(this.explosionRate);
            this.explosionTimer.on('finish', function () {this.spawnPrefab('powerup_explosion_1')}, this);
            
            this.shotgunTimer = new Timer(this.shotgunRate);
            this.shotgunTimer.on('finish', this.spawnShotgun, this);
            
            this.prefabs = this.entity.script.prefabs;
            this.player = context.root.findByName('player');
            this.cursor = context.root.findByName('cursor');
            this.camera = context.root.findByName('camera');
            this.waves = this.entity.script.waves;
            
            
            this.player.script.player.on('life', this.checkGameOver, this);
            
            context.mouse.on('mousedown', this.onMouseDown, this);
            
            // modify raycastFirst to return true / false
            context.systems.rigidbody.raycastFirst = function (start, end, callback) {
                ammoRayStart.setValue(start.x, start.y, start.z);
                ammoRayEnd.setValue(end.x, end.y, end.z);
                var rayCallback = new Ammo.ClosestRayResultCallback(ammoRayStart, ammoRayEnd);
    
                context.systems.rigidbody.dynamicsWorld.rayTest(ammoRayStart, ammoRayEnd, rayCallback);
                var hasHit = rayCallback.hasHit();
                if (hasHit) {
                    var collisionObj = rayCallback.get_m_collisionObject();
                    var body = Ammo.castObject(collisionObj, Ammo.btRigidBody);
                    var point = rayCallback.get_m_hitPointWorld();
                    var normal = rayCallback.get_m_hitNormalWorld();
    
                    if (body) {
                        callback(body.entity);
                    }
                }
    
                Ammo.destroy(rayCallback);
                return hasHit;
            };
        },
        
        onMouseDown: function () {
            context.mouse.off('mousedown', this.onMouseDown, this);
            this.isIntro = false;
        },
        
        onAttributeChanged: function (name, oldValue, newValue) {
            if (name === 'healthRate') {
                this.healthTimer.rate = newValue;
            } else if (name === 'waveStartTime') {
                this.waveStartTimer.rate = newValue;
            } else if (name === 'shotgunRate') {
                this.shotgunTimer.rate = newValue;
            }
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            TWEEN.update();
            
            if (!this.isOver && !this.isIntro) {
                this.totalTime += dt;
                if (!this.waveStarted) {
                    this.waveStartTimer.tick(dt);
                } else {
                    this.healthTimer.tick(dt);
                    this.explosionTimer.tick(dt);   
                    this.shotgunTimer.tick(dt);
                    this.waves.onUpdate(dt);
                }   
            }
        },
        
        reset: function () {
            this.fire('reset');
            this.waveStartTimer.reset();
            this.healthTimer.reset();
            this.explosionTimer.reset();
            this.waveStarted = false;
            this.enemiesKilled = 0;
            this.enemiesSpawned = 0;
            this.currentWave = -1;
            this.isOver = false;
            this.totalTime = 0;
        },
        
        startWave: function () {
            this.waveStarted = true;
            this.enemiesKilled = 0;
            this.enemiesSpawned = 0;
            this.currentWave++;
            this.fire('nextWave');
        },
        
        spawnPrefab: function (name) {
            var entity = this.prefabs.spawn(name, context.root);
            
            var x = pc.math.random(this.limitLeft, this.limitRight);
            var z = pc.math.random(this.limitUp, this.limitDown);
            pos.set(x, 0, z);
            
            entity.setPosition(pos);
            if (entity.rigidbody) {
                entity.rigidbody.syncEntityToBody();
            }
        },
        
        spawnShotgun: function () {
            var player = this.player.script.player;
            if (player.level >= this.shotgunLevel && player.getActiveWeaponName() != 'shotgun' )  {
                this.spawnPrefab('powerup_shotgun');
            }
        },
        
        onEnemySpawn: function () {
            this.enemiesSpawned++;    
        },
        
        onEnemyKilled: function (xp) {
            this.enemiesKilled++;
            this.fire('enemyKilled', this.getRemainingEnemies());
            
            if (this.getRemainingEnemies() <= 0) {
                this.waveStarted = false;
            }
            
            this.player.script.player.addXp(xp);
        },
        
        getRemainingEnemies: function () {
            return this.waves.getTotalEnemies() - this.enemiesKilled;
        },
        
        getTotalSpawnedEnemies: function () {
            return this.enemiesSpawned;  
        },
        
        isPositionInLimits: function (position) {
            return position.x >= this.limitLeft &&
                   position.x <= this.limitRight &&
                   position.z <= this.limitDown &&
                   position.z >= this.limitUp;
        },
        
        getLimitLeft: function () {
            return this.limitLeft;
        },
        
        getLimitRight: function () {
            return this.limitRight;
        },
        
        getLimitTop: function () {
            return this.limitUp;
        },
        
        getLimitBottom: function () {
            return this.limitDown;
        },
        
        getCurrentWave: function () {
            return this.currentWave;
        },
        
        xpToLevel: function (xp) {
            var level = 1;
            var xpNeeded = this.xpPerLevel;
            
            while (xp > 0) {
                xp -= xpNeeded;
                if (xp >= 0) {
                    level++
                }
                xpNeeded *= this.xpPerLevelMultiplier;
            }
            
            return level;
        },
        
        levelToXp: function (level) {
            var result = 0;
            var xpPerLevel = this.xpPerLevel;
            
            for (var i=1; i<level; i++) {
                result += xpPerLevel;
                xpPerLevel *= this.xpPerLevelMultiplier;
            }
            
            return result;
        },
        
        checkGameOver: function (life) {
            if (!this.isOver) {
                if (life <= 0) {
                    this.isOver = true;
                    this.fire('gameover');
                }   
            }
        },
        
        getTotalTime: function () {
            return this.totalTime;
        }
    };

    return Game;
});