var SIDE_TOP = 0;
var SIDE_RIGHT = 1;
var SIDE_BOTTOM = 2;
var SIDE_LEFT = 3;

var ENEMY_1 = 'enemy_snowman';
var ENEMY_2 = 'enemy_snowman_2';
var ENEMY_DIAG = 'enemy_snowman_diagonal';

var Pattern = function (context, level) {
    this.level = level;
    this.items = [];
    this.spawnIndex = 0;
    this.currentTime = 0;
    this.context = context;
};

Pattern.prototype = {
    add: function (prefab, side, position, time) {
        this.items.push({
            prefab: prefab,
            position: position,
            time: time,
            side: side
        });
    },
    
    addSubPattern: function (pattern) {
        this.items.push.apply(this.items, pattern.items);
    },
    
    prepare: function () {
        this.spawnIndex = 0;
        this.currentTime = 0;
    
        this.items.sort(function (a, b) {
            return a.time - b.time;
        });
    },
    
    update: function (dt) {
        var len = this.items.length;
        var items = this.items;
        var ct = this.currentTime;
        var idx = this.spawnIndex
        var isDone = game.getTotalSpawnedEnemies() === game.waves.getTotalEnemies();
        while (!isDone) {
            if (items[idx].time <= ct) {
                this.spawn(items[idx]);
                idx++;
                if (idx === len) {
                    isDone = true;
                } else if (game.getTotalSpawnedEnemies() === game.waves.getTotalEnemies()) {
                    isDone = true;
                }
            } else {
                break;
            }
        }
        
        this.spawnIndex = idx;
        this.currentTime += dt;
        
        return isDone; 
    },
    
    spawn: function (item) {
        var clone = game.prefabs.spawn(item.prefab, this.context.root);
        var pos = clone.getPosition();
        
        var ll = game.getLimitLeft();
        var lr = game.getLimitRight();
        var lt = game.getLimitTop();
        var lb = game.getLimitBottom();
        
        switch (item.side) {
            case SIDE_TOP:
                pos.z = lt;
                pos.x = pc.math.lerp(ll, lr, item.position);
                break;
            case SIDE_RIGHT:
                pos.x = lr;
                pos.z = pc.math.lerp(lb, lt, item.position);
                break;
            case SIDE_BOTTOM:
                pos.z = lb;
                pos.x = pc.math.lerp(ll, lr, item.position);
                break;
            case SIDE_LEFT:
                pos.x = ll;
                pos.z = pc.math.lerp(lb, lt, item.position);
                break;
        }
        
        clone.setPosition(pos);
        
        if (clone.rigidbody) {
            clone.rigidbody.syncEntityToBody();
        }
        
        game.onEnemySpawn();
        
        return clone;
    }
};


pc.script.create('waves', function (context) {
    // Creates a new Waves instance
    var Waves = function (entity) {
        this.entity = entity;
        this.patterns = [];
        
        var pl3 = new Pattern(context, 0);
        pl3.add(ENEMY_1, SIDE_LEFT, 0.5, 0);
        pl3.add(ENEMY_1, SIDE_LEFT, 0.6, 0.1);
        pl3.add(ENEMY_1, SIDE_LEFT, 0.4, 0.1);
        this.patterns.push(pl3);
        
        var pr3 = new Pattern(context, 0);
        pr3.add(ENEMY_1, SIDE_RIGHT, 0.5, 0);
        pr3.add(ENEMY_1, SIDE_RIGHT, 0.6, 0.1);
        pr3.add(ENEMY_1, SIDE_RIGHT, 0.4, 0.1);
        this.patterns.push(pr3);
        
        var pt3 = new Pattern(context, 1);
        pt3.add(ENEMY_1, SIDE_TOP, 0.5, 0);
        pt3.add(ENEMY_1, SIDE_TOP, 0.6, 0.1);
        pt3.add(ENEMY_1, SIDE_TOP, 0.4, 0.1);
        this.patterns.push(pt3);
        
        var pb3 = new Pattern(context, 1);
        pb3.add(ENEMY_1, SIDE_BOTTOM, 0.5, 0);
        pb3.add(ENEMY_1, SIDE_BOTTOM, 0.6, 0.1);
        pb3.add(ENEMY_1, SIDE_BOTTOM, 0.4, 0.1);
        this.patterns.push(pb3);
        
        var plr = new Pattern(context, 2);
        plr.addSubPattern(pl3);
        plr.addSubPattern(pr3);
        this.patterns.push(plr);
        
        var p360 = new Pattern(context, 3);
        for (var i=0; i<4; i++) {
            for (var j=0; j<5; j++) {
                p360.add(ENEMY_1, i, j/5, 0);        
            }
        }
        this.patterns.push(p360);
        
        
        var pt1 = new Pattern(context, 4);
        pt1.add(ENEMY_1, SIDE_LEFT, 0.4, 0);
        pt1.add(ENEMY_2, SIDE_LEFT, 0.5, 0);
        pt1.add(ENEMY_2, SIDE_LEFT, 0.1, 2);
        pt1.add(ENEMY_2, SIDE_LEFT, 0.9, 2);
        pt1.add(ENEMY_1, SIDE_LEFT, 0.6, 0);
        
        pt1.add(ENEMY_1, SIDE_TOP, 0.4, 2);
        pt1.add(ENEMY_2, SIDE_TOP, 0.5, 2);
        pt1.add(ENEMY_2, SIDE_TOP, 0.1, 4);
        pt1.add(ENEMY_2, SIDE_TOP, 0.9, 4);
        pt1.add(ENEMY_1, SIDE_TOP, 0.6, 2);
        
        pt1.add(ENEMY_1, SIDE_RIGHT, 0.4, 4);
        pt1.add(ENEMY_2, SIDE_RIGHT, 0.5, 4);
        pt1.add(ENEMY_2, SIDE_RIGHT, 0.1, 6);
        pt1.add(ENEMY_2, SIDE_RIGHT, 0.9, 6);
        pt1.add(ENEMY_1, SIDE_RIGHT, 0.6, 4);
        
        pt1.add(ENEMY_1, SIDE_BOTTOM, 0.4, 6);
        pt1.add(ENEMY_2, SIDE_BOTTOM, 0.5, 6);
        pt1.add(ENEMY_2, SIDE_BOTTOM, 0.1, 8);
        pt1.add(ENEMY_2, SIDE_BOTTOM, 0.9, 8);
        pt1.add(ENEMY_1, SIDE_BOTTOM, 0.6, 6);
        this.patterns.push(pt1);
        
        var pt4 = new Pattern(context, 5)
        pt4.add(ENEMY_1, SIDE_LEFT, 0.25, 0);
        pt4.add(ENEMY_1, SIDE_LEFT, 0.5, 0);
        pt4.add(ENEMY_1, SIDE_LEFT, 0.75, 0);
        
        pt4.add(ENEMY_1, SIDE_RIGHT, 0.25, 0);
        pt4.add(ENEMY_1, SIDE_RIGHT, 0.5, 0);
        pt4.add(ENEMY_1, SIDE_RIGHT, 0.75, 0);
        
        pt4.add(ENEMY_1, SIDE_BOTTOM, 0.25, 0);
        pt4.add(ENEMY_1, SIDE_BOTTOM, 0.5, 0);
        pt4.add(ENEMY_1, SIDE_BOTTOM, 0.75, 0);
        
        pt4.add(ENEMY_1, SIDE_TOP, 0.25, 0);
        pt4.add(ENEMY_1, SIDE_TOP, 0.5, 0);
        pt4.add(ENEMY_1, SIDE_TOP, 0.75, 0);
        
        pt4.add(ENEMY_2, SIDE_LEFT, 0.5, 0);
        pt4.add(ENEMY_2, SIDE_RIGHT, 0.5, 0);
        pt4.add(ENEMY_2, SIDE_BOTTOM, 0.5, 0);
        pt4.add(ENEMY_2, SIDE_TOP, 0.5, 0);
        pt4.add(ENEMY_DIAG, SIDE_LEFT, 0.5, 3);
        pt4.add(ENEMY_DIAG, SIDE_RIGHT, 0.5, 4);
        pt4.add(ENEMY_DIAG, SIDE_BOTTOM, 0.5, 5);
        pt4.add(ENEMY_DIAG, SIDE_TOP, 0.5, 6);
        this.patterns.push(pt4);
        
        var pt5 = new Pattern(context, 6)
        pt5.add(ENEMY_2, SIDE_LEFT, 0.25, 0);
        pt5.add(ENEMY_2, SIDE_LEFT, 0.5, 1);
        pt5.add(ENEMY_2, SIDE_LEFT, 0.75, 2);
        pt5.add(ENEMY_2, SIDE_LEFT, 0.25, 3);
        pt5.add(ENEMY_2, SIDE_LEFT, 0.5, 4);
        pt5.add(ENEMY_2, SIDE_LEFT, 0.75, 5);
        
        pt5.add(ENEMY_2, SIDE_RIGHT, 0.25, 0);
        pt5.add(ENEMY_2, SIDE_RIGHT, 0.5, 1);
        pt5.add(ENEMY_2, SIDE_RIGHT, 0.75, 2);
        pt5.add(ENEMY_2, SIDE_RIGHT, 0.25, 3);
        pt5.add(ENEMY_2, SIDE_RIGHT, 0.5, 4);
        pt5.add(ENEMY_2, SIDE_RIGHT, 0.75, 5);
        
        pt5.add(ENEMY_2, SIDE_BOTTOM, 0.25, 0);
        pt5.add(ENEMY_2, SIDE_BOTTOM, 0.5, 1);
        pt5.add(ENEMY_2, SIDE_BOTTOM, 0.75, 2);
        pt5.add(ENEMY_2, SIDE_BOTTOM, 0.25, 3);
        pt5.add(ENEMY_2, SIDE_BOTTOM, 0.5, 4);
        pt5.add(ENEMY_2, SIDE_BOTTOM, 0.75, 5);
        
        pt5.add(ENEMY_2, SIDE_TOP, 0.25, 0);
        pt5.add(ENEMY_2, SIDE_TOP, 0.5, 1);
        pt5.add(ENEMY_2, SIDE_TOP, 0.75, 2);
        pt5.add(ENEMY_2, SIDE_TOP, 0.25, 3);
        pt5.add(ENEMY_2, SIDE_TOP, 0.5, 4);
        pt5.add(ENEMY_2, SIDE_TOP, 0.75, 5);
        
        pt5.add(ENEMY_DIAG, SIDE_LEFT, 0.5, 0);
        pt5.add(ENEMY_DIAG, SIDE_RIGHT, 0.5, 0);
        pt5.add(ENEMY_DIAG, SIDE_BOTTOM, 0.5, 0);
        pt5.add(ENEMY_DIAG, SIDE_TOP, 0.5, 0);
        pt5.add(ENEMY_DIAG, SIDE_LEFT, 0.5, 3);
        pt5.add(ENEMY_DIAG, SIDE_RIGHT, 0.5, 4);
        pt5.add(ENEMY_DIAG, SIDE_BOTTOM, 0.5, 5);
        pt5.add(ENEMY_DIAG, SIDE_TOP, 0.5, 6);
        this.patterns.push(pt5);
        
        this.activePattern = null;
        this.timer = new Timer(2, true);
        this.timer.on('finish', this.newPattern, this);
    };

    Waves.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            game.on('reset', this.reset, this);
        },
        
        reset: function () {
            this.activePattern = null;
            this.timer.reset();
        },

        onUpdate: function (dt) {
            if (!this.activePattern) {
                this.timer.tick(dt);   
            } else {
                if (this.activePattern.update(dt)) {
                    this.activePattern = null; // pattern done so generate new
                }
            }
        },
        
        newPattern: function () {
            var level = game.getCurrentWave();
            
            function filter (pattern) {
                return pattern.level === level;
            }
            
            var candidates = this.patterns.filter(filter);
            
            // no patterns found, look for easier ones
            while (!candidates.length) {
                level--;
                candidates = this.patterns.filter(filter); 
            }
            
            this.activePattern = candidates[Math.floor(pc.math.random(0, candidates.length))];
            //this.activePattern = this.patterns[this.patterns.length-1];
            this.activePattern.prepare();
        },
        
        getTotalEnemies: function () {
            return Math.min((game.getCurrentWave() + 1) * 10, 100);
        }
    };

    return Waves;
});