
var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.controller.bcnRT = function(options)
{

    // Referencia a esta instancia

    var self = {};


    // Inits

    self.dataIn = "all";

    // Copies

    var INTRO_TEXT = "BCN RealTime is a blah blah";

    self.footerInfo = "Footer";


    // Pongo lo que me venga por opciones en el self

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }


    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html en el div padre

        var injectString =
            ['<div id="contenedorTodo" class="wrapper">',
                '<header>',
                  '<h1>BCN.citybeats - <span class="opcionesContent" id="showTime">----/--/-- | --:--:--</span></h1>',
                  '<div class="selector-holder"><h4>Choose Source:</h4> <select id="dataset" style="width:100px;">',
                    '<option value="all" selected>all</option>',
                    '<option value="bicing">bicing</option>',
                    '<option value="instagram">instagram</option>',
                    '<option value="traffic">transit</option>',
                    '<option value="foursquare">foursquare</option>',
                    '<option value="twitter">twitter</option>',
                  '</select></div>',
                '</header>',
                '<div id="chartContent" class="chartContent"></div>',
                '<div id="zonaInfo" class="zonaInfo">',
                    '<div class="legend">',
                      '<h4>Color key</h4>',
                      '<div id="legendContent" class="legendContent"></div>',
                    '</div>',
                '</div>',
                '<footer id="footer" class="footer"><p>'+self.footerInfo+' / Credits</p></footer>',
             '</div>'
            ].join('\n');




        $(self.parentSelect).html(injectString);


        // Instancio el objeto networkChart

        self.bcnChart = tdviz.viz.bcnRT(
            {
                'visTitle':"BCN beats",
                'idName':"chartContent",
                'idInfo': self.idInfo,
                'width': $('#chartContent').width(),
                'height': $('#chartContent').height(),
                'transTime':self.transTime,
                'legendId':"legendContent",
                'loadingMessage':"Loading data...",
                'scaleType': self.scaleType,
                'sizeScale':self.sizeScale,
                'myLog':myLog
            });

        // Pido el fichero de datos

        d3.json(self.urlBase, function(netData)
        {
           if(netData!=null)
           {
               self.netData = netData;

               console.log("DATOS!!!!");
               console.log(self.netData);

               // primer render de la red

               self.bcnChart.render(self.netData,self.dataIn);

               $('#showTime').html(moment().format('MMMM Do YYYY | h:mm:ss a'));


               $('#dataset').change(function(){

                   self.dataIn = this.value;

                   console.log("change");

                   self.bcnChart.render(self.netData,self.dataIn);

                   $('#showTime').html(moment().format('MMMM Do YYYY | h:mm:ss a'));

               });


               self.refreshData = function ()
               {
                           d3.json(self.urlBase, function(netData)
                            {
                                if(netData!=null)
                                {
                                           self.netData = netData;

                                           console.log("DATOS REFRESH!!!!");
                                           console.log(self.netData);

                                           // primer render de la red

                                           self.bcnChart.render(self.netData,self.dataIn);

                                           $('#showTime').html(moment().format('MMMM Do YYYY | h:mm:ss a'));
                                }
                            });
               }

               setInterval(self.refreshData, self.refreshInt);

           }
           else
           {
               myLog("Could not load file: "+self.baseJUrl+self.EVENTS_FILE,1);
           }
        });

        $("#dataset").select2({
          minimumResultsForSearch: 99999
        });
    });
}
