function DateSlider(paramObj)
{

    var that = this;

    // Pillo los parametros como global vars

    this.parentId = paramObj.idName;
    this.parentSelect = "#" + this.parentId;
    this.className = paramObj.className;
    this.imgPath = paramObj.imgPath;
    this.beginDate = paramObj.beginDate;
    this.endDate = paramObj.endDate;
    this.callBack = paramObj.callBack;
    this.myLog = paramObj.logCallBack;
    this.myInterval = paramObj.interval;

    this.myLog(paramObj,3);

    // Global de playing

    this.playing = false;

    this.init = init;

    this.init();

    function init()
    {
        this.myLog("Inicio dateslider en "+this.parentId,3);

        var injectString =
                ['<div class="play"><img class="playImg" src="'+this.imgPath+'play-on.gif" height="25" width="25"></div>',
                '<div class="slider"></div>',
                '<div class="fechaText"></div>'
            ].join('\n');

        $(this.parentSelect).html(injectString);

        // Inserto el componente slider

        var sliderSelect = this.parentSelect + " .slider";

        this.myLog("select del slider:" + sliderSelect,3);

        // Y calculo el número de días

        this.numDays = this.endDate.clone().diff(this.beginDate.clone(),'days')+1;

        this.nowDate = this.beginDate.clone();

        this.slider = $(sliderSelect).slider({
            value:1,
            min: 1,
            max: this.numDays,
            step: 1,
            disabled: false
        });

        // Pongo el contenido de la fecha inicial

        $(this.parentSelect+" .fechaText").html(this.nowDate.format("DD.MM.YYYY"));



        // Ato el evento del cambio de slider

        this.slider.bind( "slidechange", function(event, ui)
        {

            that.nowDate = that.beginDate.clone().add('days',ui.value-1);

            that.myLog("Cambio de slider...",3);

            $(that.parentSelect+" .fechaText").html(that.nowDate.format("DD.MM.YYYY"));

            // Y llamo al callback

            //that.callBack.call(that.nowDate.clone().format("YYYYMMDD"));

            that.callBack(that.nowDate.clone());
        });

            // Voy con las alarmas y los clicks

            function avanzaPlay()
            {
                that.myLog("Avanzo el slider auto",10);
                that.myLog("El nowDate es ",4);
                that.myLog(that.nowDate,4);

                if((that.playing==true) && (that.nowDate<that.endDate))
                {
                    // Añado un día a la nowDate

                    that.nowDate = that.nowDate.clone().add('days',1);

                    // Refresco datos....

                    $( that.parentSelect + " .slider" ).slider('value', $( that.parentSelect + " .slider" ).slider('value') + 1);
                }

                // Es el ultimo dia: me paro y pongo a play el boton (estoy en pause)

                var myDiff = that.endDate.clone().diff(that.nowDate,'days');

                that.myLog("la diff es",4);
                that.myLog(myDiff,4);
                that.myLog(that.endDate,4);

                if ((that.playing==true) && (that.endDate.clone().diff(that.nowDate,'days')<1))
                {
                    that.myLog("Estoy en el ultimo dia",4);
                    $(that.parentSelect+" .play").html('<img src="'+that.imgPath+'play-on.gif" height="25" width="25">');
                    that.playing = false;
                }

            }

            // Manejo de play/pause


            $(this.parentSelect+" .play").click(function (){

                that.myLog("pinchadoDate",3);

                if(that.playing==false)
                {

                    that.myLog("playing es false",3);

                    // Si esta parado, pero estoy en el ultimo dia...

                    if((that.endDate.clone().diff(that.nowDate.clone(),'days')<1))
                    {
                        clearInterval(refreshId);

                        that.myLog("rebobino",3);

                        that.myLog("estoy en el ultimo dia",3);

                        that.nowDate = that.beginDate.clone().add('days',0);

                        $( that.parentSelect + " .slider" ).slider('value', 1);

                        refreshId = setInterval(avanzaPlay, that.myInterval);
                    }

                    that.playing = true;

                    that.myLog("no estoy en el ultimo dia",3);

                    $(that.parentSelect+" .play").html('<img src="'+that.imgPath+'pause-on.gif" height="25" width="25">');

                }
                else
                {
                    that.myLog("playing es true",3);

                    that.playing = false;

                    $(that.parentSelect+" .play").html('<img src="'+that.imgPath+'play-on.gif" height="25" width="25">');

                }

            });

            var refreshId = setInterval(avanzaPlay, this.myInterval);

            // NOOOOO--> Condicion de carrera

            // Llamo al callback para la fecha de ahora [primer render]

            //this.callBack.call(this.nowDate.clone());


        // Bug del setInterval de javascript: Cuando me cambio de ventana, me paro

        window.addEventListener('blur', function() {
            that.playing = false;

            $(that.parentSelect+" .play").html('<img src="'+that.imgPath+'play-on.gif" height="25" width="25">');

        });

    }
}
