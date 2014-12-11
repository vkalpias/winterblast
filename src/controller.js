pc.script.attribute('speed', 'number', 5);

pc.script.create('controller', function (context) {
    var temp = new pc.Vec3();
    var mat = new pc.Mat4();
    var mat2 = new pc.Mat4();
    var quat = new pc.Quat();
    
    // Creates a new Controller instance
    var Controller = function (entity) {
        this.entity = entity;
        this.player = null;
        this.particles = [];
        this.isThrusterSoundPlaying = false;
        this.thrusterVolumeTween = null;
    };

    Controller.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.player = this.entity.script.player;
            this.entity.rigidbody.group = 128;
            this.particles.push(this.entity.findByName('particles_left'));
            this.particles.push(this.entity.findByName('particles_right'));
            this.particles.push(this.entity.findByName('particles_back'));
            this.thrusterAudio = this.entity.findByName('audio').audiosource;
            
            this.entity.script.steer.velocityCalculator = this;
            
            game.on('gameover', this.onGameover, this);
            game.on('reset', this.reset, this);
        },
        
        postInitialize: function () {
            this.reset();
        },
        
        reset: function () {
            this.toggleParticles(false);
            this.stopThrusterSound();
            this.entity.script.enabled = true;
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (this.player.activeWeapon) {
                this.player.activeWeapon.handleInput(dt);
            }
        },
        
        toggleParticles: function (toggle) {
            for (var i=0; i<this.particles.length; i++) {
                if (!toggle) {
                    this.particles[i].particlesystem.stop();
                } else {
                    this.particles[i].particlesystem.play();
                }
            }  
        },
        
        calculateVelocity: function (dt) {
            var hor = 0
            var ver = 0;
            
            if (context.keyboard.isPressed(pc.input.KEY_A) ||
                context.keyboard.isPressed(pc.input.KEY_LEFT)) {
                hor = -1;
            } else if (context.keyboard.isPressed(pc.input.KEY_D) ||
                       context.keyboard.isPressed(pc.input.KEY_RIGHT)) {
                hor = 1;
            }
            
            if (context.keyboard.isPressed(pc.input.KEY_W) ||
               context.keyboard.isPressed(pc.input.KEY_UP)) {
                ver = -1;
            } else if (context.keyboard.isPressed(pc.input.KEY_S) ||
                       context.keyboard.isPressed(pc.input.KEY_DOWN)) {
                ver = 1;
            }
            
            temp.set(hor, 0, ver);
            if (ver !== 0 || hor !== 0) {
                temp.normalize().scale(this.speed);
                this.toggleParticles(true);
                this.playThrusterSound();
            } else {
                this.toggleParticles(false);
                this.stopThrusterSound();
            }
            
            return temp;
        },
        
        stopThrusterSound: function () {
            if (!this.isThrusterSoundPlaying) {
                return;
            }
            
            this.isThrusterSoundPlaying = false;
            var self = this;
            
            if (this.thrusterVolumeTween) {
                this.thrusterVolumeTween.stop();
            }
                
            this.thrusterVolumeTween = new TWEEN.Tween({ volume: 1 })
            .to({ volume: 0 }, 700)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(function () {
                self.thrusterAudio.volume = this.volume;
            }).onComplete(function (){
               self.thrusterVolumeTween = null; 
            })
            .start();
        },
        
        playThrusterSound: function () {
            if (this.isThrusterSoundPlaying) {
                return;
            }
            
            this.isThrusterSoundPlaying = true;
            var self = this;
            
            if (this.thrusterVolumeTween) {
                this.thrusterVolumeTween.stop();
            }
                
            this.thrusterVolumeTween = new TWEEN.Tween({ volume: 0 })
            .to({ volume: 1 }, 700)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(function () {
                self.thrusterAudio.volume = this.volume;
            }).onComplete(function (){
               self.thrusterVolumeTween = null; 
            })
            .start();
        },
        
        onGameover: function () {
            this.entity.script.enabled = false;
        }
    };

    return Controller;
});