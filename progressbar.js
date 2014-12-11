pc.script.create('progressbar', function (context) {
    var Progressbar = function (entity) {
        this.entity = entity;
        this.progress = null;
        this.foreground = null;
        this.initialWidth = 0;
        this.initialLeft = 0;
    };

    Progressbar.prototype = {
        initialize: function () {
            this.foreground = this.entity.script.sprite;
            this.initialWidth = this.foreground.width;
            this.initialLeft = this.foreground.x;
            this.setProgress(1);
        },

        setProgress: function (progress) {
            progress = pc.math.clamp(progress, 0, 1);
            if (this.progress !== progress) {
                this.progress = progress;
                this.foreground.width = pc.math.lerp(0, this.initialWidth, progress);
                this.foreground.uPercentage = progress;

               
                this.foreground.updateSprite();
            }
        }
    };

    return Progressbar;
});