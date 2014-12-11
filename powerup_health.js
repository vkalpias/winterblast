pc.script.attribute('health', 'number', 20);
pc.script.attribute('duration', 'number', 5);

pc.script.create('powerup_health', function (context) {
    // Creates a new Powerup_health instance
    var Powerup_health = function (entity) {
        this.entity = entity;
        this.timer = null;
        this.modelEntity = null;
        this.lightEntity = null;
        this.modelTween = null;
    };

    Powerup_health.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.entity.collision.on('triggerenter', this.onTrigger, this);            
            this.timer = new Timer(this.duration);
            this.timer.on('finish', function () {
                game.prefabs.destroy(this.entity);
            }.bind(this));
            
            this.modelEntity = this.entity.findByName('model');
            this.lightEntity = this.entity.findByName('light');
        },
        
        onEnable: function () {
            this.timer.reset();  
            var model = this.modelEntity;
            model.enabled = true;
            
            var light = this.lightEntity;
            light.enabled = false;
            
            
            this.modelTween = new TWEEN.Tween({ y: 0.5 })
            .to({ y: 1 }, 800)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .repeat(Infinity)
            .onUpdate(function () {
                var pos = model.getPosition();
                pos.y = this.y;
                model.setPosition(pos);
            })
            .start()
        },
        
        onTrigger: function (other) {
            if (other === game.player) {
                game.player.script.player.addLife(this.health);
                this.modelTween.stop();
                game.prefabs.destroy(this.entity);
            }
        },
        
        update: function (dt) {
            this.timer.tick(dt);
        }
    };

    return Powerup_health;
});