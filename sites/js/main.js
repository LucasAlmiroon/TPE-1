document.addEventListener ("DOMContentLoaded", function(){

    let canvas = document.querySelector("#canvas");
    let ctx = canvas.getContext("2d");
    let input = document.querySelector('#inputGroupFile01');
    //Creo estas variables para guardar el tamaño original del canvas.
    let cw = canvas.width;
    let ch = canvas.height;
    let dataImgAnterior;
    let filtroAplicado = false;
    let gomaActiva = false;
    let lapizActivo = false;

    //Limpia el input, limpia el imagedata y genera un canvas nuevo.
    function canvasNuevo(){
        input.value= '';
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        for(let x = 0; x <= canvas.width; x++){
          for (let y = 0; y <= canvas.height; y++){
            let index = (x*imageData.width*y)*4;
            imageData.data[index + 0] = 255;
            imageData.data[index + 1] = 255;
            imageData.data[index + 2] = 255;
          }
        }
        ctx.putImageData(imageData,0,0);
        canvas.width = cw;
        canvas.height = ch;
        ctx.fillStyle ="white";
        ctx.fillRect(0,0,cw,ch);
      }

    //Cuando llega el evento al input, ejecuta el cargarImagen.
    input.onchange = e =>{cargarImagen(e)}
    function cargarImagen(e){
        //Lee el archivo y lo dibuja en el canvas.
        let file = e.target.files[0];
        
        let reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = readerEvent => {
            let content = readerEvent.target.result;   
            let image = new Image();          
            image.src = content;          
            image.onload = function(){
                canvas.width = this.width;
                canvas.height = this.height;
                ctx.drawImage(image,0,0,canvas.width,canvas.height);
                //Conserva el data de la imagen original, para despues aplicar filtros.
                dataImgAnterior = ctx.getImageData(0,0,canvas.width,canvas.height);
            }
        }
      }

    function descargar(){
        let dataURL = canvas.toDataURL("image/jpeg", 1.0);
        downloadImage(dataURL, 'imagen.jpeg');
    }
    function downloadImage(data, filename = 'untitled.jpeg') {
        let a = document.createElement('a');
        a.href = data;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
    }
    //Filtros

    //Verifica si hay un filtro aplicado, para no aplicar uno sobre otro, utilizando la imagen original.
    function verificarFiltro(){

        desactivarRangosyLabel();

        if (filtroAplicado){
          ctx.putImageData(dataImgAnterior,0,0);
        }else{
          filtroAplicado = true;
        }
      }
    //Aca utilizo 4 funciones generales, para el RGB y Alpha.
    function getRed(index,imageData){

        return  imageData.data[index + 0];
    }
    
    function getGreen(index,imageData){
        return  imageData.data[index + 1];
    }
        
    function getBlue(index,imageData){
        return  imageData.data[index + 2];
    }

    function getAlpha(index,imageData){
        return  imageData.data[index + 3];
    }
    //Aplica filtro negativo, pidiendo los rgb de la imagen y restandoselo a 255
    function aplicarFiltroNegativo(){
        verificarFiltro();
        
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        let w = imageData.width;
        let h = imageData.height;
        for (let x = 0; x < w; x++){
            for (let y = 0; y < h; y++){
                let index = (x + w * y)*4;
                let r = getRed(index,imageData);
                let g = getGreen(index,imageData);
                let b = getBlue(index,imageData);
                
                imageData.data[index + 0] = 255 - r;
                imageData.data[index + 1] = 255 - g;
                imageData.data[index + 2] = 255 - b;
            
            }
        }
        ctx.putImageData(imageData, 0, 0);          
    }
    //En el filtro gris, se hace un promedio de los valores rgb.
    function aplicarFiltroGris(){
        verificarFiltro();
    
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        let w = imageData.width;
        let h = imageData.height;
        for (let x = 0; x < w; x++){
            for (let y = 0; y < h; y++){  
                let index = (x + w * y)*4;
                let r = getRed(index,imageData);
                let g = getGreen(index,imageData);
                let b = getBlue(index,imageData);
                
                let gris = (r+g+b)/3;
                
                imageData.data[index + 0] = gris;
                imageData.data[index + 1] = gris;
                imageData.data[index + 2] = gris;
            
            }
        }
        ctx.putImageData(imageData, 0, 0);            
    }
    //Para el filtro sepia se utiliza esa formula, sacando el porcentaje en rgb de cada pixel
    function aplicarFiltroSepia(){
        verificarFiltro();
    
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        let w = imageData.width;
        let h = imageData.height;
        for (let x = 0; x < w; x++){      
            for (let y = 0; y < h; y++){
                let index = (x + w * y)*4;
                let r = getRed(index,imageData);
                let g = getGreen(index,imageData);
                let b = getBlue(index,imageData);
                
                let sepia = ((0.3 * r) + (0.6* g) + (0.1* b))
                
                imageData.data[index + 0] = Math.min(sepia + 40,255);
                imageData.data[index + 1] = Math.min(sepia + 15,255);
                imageData.data[index + 2] = sepia;
            }
        }
        ctx.putImageData(imageData, 0, 0);            
      }
    //Para el filtro binario se busca el promedio del rgb y dependiendo si es menor o mayor a 127 se elige si hacerlo blanco o negro.
    function aplicarFiltroBinario(){
        verificarFiltro(); 
        
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        let w = imageData.width;
        let h = imageData.height;
        
        for (let x = 0; x < w; x++){
            for (let y = 0; y < h; y++){
            
                let index = (x + w * y)*4;
                let r = getRed(index,imageData);
                let g = getGreen(index,imageData);
                let b = getBlue(index,imageData);
                
                if (((r + g + b)/3) <= 127){
                
                imageData.data[index + 0] = 0;
                imageData.data[index + 1] = 0;
                imageData.data[index + 2] = 0;
                
                }else{
                
                imageData.data[index + 0] = 255;
                imageData.data[index + 1] = 255;
                imageData.data[index + 2] = 255;
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    function aplicarFiltroBlur(){
        verificarFiltro(); 
        
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        let w = imageData.width;
        let h = imageData.height;
        
        for (let x = 1; x < w-1; x++){
            for (let y = 1; y < h-1; y++){
                let index = (x + w * y)*4;
                let r = redSobel(x,y,w,index,imageData);
                let g = greenSobel(x,y,w,index,imageData);
                let b = blueSobel(x,y,w,index,imageData);
                let a = alphaSobel(x,y,w,index,imageData);
                

                imageData.data[index + 0] = r;
                imageData.data[index + 1] = g;
                imageData.data[index + 2] = b;
                imageData.data[index + 3] = a;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    function redSobel(x,y,w,index,imageData){
        let r1 = getRed(index,imageData);
        index = ((x-1) + w * (y-1))*4;
        let r2 = getRed(index,imageData);
        index = ((x-1) + w * y)*4;
        let r3 = getRed(index,imageData);
        index = ((x-1) + w * (y+1))*4;
        let r4 = getRed(index,imageData);
        index = ((x+1) + w * (y-1))*4;
        let r5 = getRed(index,imageData);
        index = ((x+1) + w * (y+1))*4;
        let r6 = getRed(index,imageData);
        index = ((x+1) + w * y)*4;
        let r7 = getRed(index,imageData);
        index = (x + w * (y+1))*4;
        let r8 = getRed(index,imageData);
        index = (x + w * (y-1))*4;
        let r9 = getRed(index,imageData);

        let promedioRojo = (r1 + r2 + r3 + r4 + r5 + r6 + r7 + r8 + r9)/9;
        
        return promedioRojo;
    }

    function greenSobel(x,y,w,index,imageData){
        let g1 = getGreen(index,imageData);
        index = ((x-1) + w * (y-1))*4;
        let g2 = getGreen(index,imageData);
        index = ((x-1) + w * y)*4;
        let g3 = getGreen(index,imageData);
        index = ((x-1) + w * (y+1))*4;
        let g4 = getGreen(index,imageData);
        index = ((x+1) + w * (y-1))*4;
        let g5 = getGreen(index,imageData);
        index = ((x+1) + w * (y+1))*4;
        let g6 = getGreen(index,imageData);
        index = ((x+1) + w * y)*4;
        let g7 = getGreen(index,imageData);
        index = (x + w * (y+1))*4;
        let g8 = getGreen(index,imageData);
        index = (x + w * (y-1))*4;
        let g9 = getGreen(index,imageData);

        let promedioGreen = (g1 + g2 + g3 + g4 + g5 + g6 + g7 + g8 + g9)/9;
        
        return promedioGreen;
    }
    function blueSobel(x,y,w,index,imageData){
        let b1 = getBlue(index,imageData);
        index = ((x-1) + w * (y-1))*4;
        let b2 = getBlue(index,imageData);
        index = ((x-1) + w * y)*4;
        let b3 = getBlue(index,imageData);
        index = ((x-1) + w * (y+1))*4;
        let b4 = getBlue(index,imageData);
        index = ((x+1) + w * (y-1))*4;
        let b5 = getBlue(index,imageData);
        index = ((x+1) + w * (y+1))*4;
        let b6 = getBlue(index,imageData);
        index = ((x+1) + w * y)*4;
        let b7 = getBlue(index,imageData);
        index = (x + w * (y+1))*4;
        let b8 = getBlue(index,imageData);
        index = (x + w * (y-1))*4;
        let b9 = getBlue(index,imageData);

        let promedioBlue = (b1 + b2 + b3 + b4 + b5 + b6 + b7 + b8 + b9)/9;
        
        return promedioBlue;
    }

    function alphaSobel(x,y,w,index,imageData){
        let a1 = getAlpha(index,imageData);
        index = ((x-1) + w * (y-1))*4;
        let a2 = getAlpha(index,imageData);
        index = ((x-1) + w * y)*4;
        let a3 = getAlpha(index,imageData);
        index = ((x-1) + w * (y+1))*4;
        let a4 = getAlpha(index,imageData);
        index = ((x+1) + w * (y-1))*4;
        let a5 = getAlpha(index,imageData);
        index = ((x+1) + w * (y+1))*4;
        let a6 = getAlpha(index,imageData);
        index = ((x+1) + w * y)*4;
        let a7 = getAlpha(index,imageData);
        index = (x + w * (y+1))*4;
        let a8 = getAlpha(index,imageData);
        index = (x + w * (y-1))*4;
        let a9 = getAlpha(index,imageData);

        let promedioAlpha = (a1 + a2 + a3 + a4 + a5 + a6 + a7 + a8 + a9)/9;
        
        return promedioAlpha;
    }

    //Para aplicar brillo a las fotos se les suma un valor fijo a cada RGB en cada pixel.
    function cambiarBrillo(){
        verificarFiltro();

        document.querySelector("#labelBrillo").style.visibility = "visible";
        document.querySelector("#rangobrillo").style.visibility = "visible";

        let k = document.querySelector("#rangobrillo").value*1.0;
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    
        for (let y=0;y<canvas.height;y++){
            for (let x=0;x<canvas.width;x++){
                index=(x+y*imageData.width)*4;
                imageData.data[index+0]=rangeColor(imageData.data[index + 0] + k);
                imageData.data[index+1]=rangeColor(imageData.data[index + 1] + k);
                imageData.data[index+2]=rangeColor(imageData.data[index + 2] + k);
            }
        }
        
        ctx.putImageData(imageData,0,0);
    }

    //Para cambiar el contraste se utiliza la siguiente formula, la cual se multiplica.
    function cambiarContraste(){
        verificarFiltro();

        document.querySelector("#labelContraste").style.visibility = "visible";
        document.querySelector("#rangocontraste").style.visibility = "visible";     
    
        let rango = document.querySelector("#rangocontraste").value*1.0;
    
        let contraste = Math.tan(rango * Math.PI / 180.0);
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    
        for (let y=0;y<canvas.height;y++){
            for (let x=0;x<canvas.width;x++){
                index=(x+y*imageData.width)*4;
                imageData.data[index+0]=rangeColor(128 + ((imageData.data[index + 0] - 128) * contraste));
                imageData.data[index+1]=rangeColor(128 + ((imageData.data[index + 1] - 128) * contraste));
                imageData.data[index+2]=rangeColor(128 + ((imageData.data[index + 2] - 128) * contraste));
            }
        }
        
        ctx.putImageData(imageData,0,0);
      }

    //Se utiliza esta funcion para los parametros que dejan de estar en el rango de 0-255
    function rangeColor(pixel) {
        if (pixel < 0){
            pixel = 0;
        }
        if (pixel > 255){
            pixel = 255;
        }
        return pixel;
    }

    //Herramientas

    //Funcion para conocer la posicion en el canvas.
    function oMousePos(canvas, e) {
        let ClientRect = canvas.getBoundingClientRect();
             return {
             x: Math.round(e.clientX - ClientRect.left),
             y: Math.round(e.clientY - ClientRect.top)
      }};
    
    //Diseño para el cursor, para que el usuario sepa que herramienta esta usando
    function changeToCursor1(){
        if (lapizActivo){
          document.body.style.cursor="url('./sites/img/lapiz.ico'), default";
        }else if(gomaActiva){
          document.body.style.cursor="url('./sites/img/goma.ico'), default";  
        }
    }
    
    /*Captura los movimientos del mouse, verifica si se esta usando el lapiz o la goma. Utilizo la variable dibujando
    para cuando se haga el evento mouseup tenga un parametro para dejar de dibujar.*/
    function herramientas(dibujando){    
        canvas.addEventListener('mousedown', e => {
            dibujando = true;
            ctx.beginPath();
        });
        
        canvas.addEventListener("mousemove", e => {
            if (dibujando) {
                let m = oMousePos(canvas, e);
                if (lapizActivo){
                    ctx.lineTo(m.x, m.y);
                    let color = document.querySelector("#colorLapiz").value;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }else if (gomaActiva){
                    ctx.fillStyle ="white";
                    let rangogoma = document.querySelector("#rangogoma");
                    ctx.fillRect(m.x,m.y,rangogoma.value,rangogoma.value);
                }
            }
        });

        canvas.addEventListener('mouseup', e => {
            dibujando = false;
        });    
    }
    
    //Activa el lapiz y desactiva la goma
    function dibujar(){
        let dibujando = false;
        lapizActivo = true;
        gomaActiva = false;
        desactivarRangosyLabel();
        document.querySelector("#labelLapiz").style.visibility = "visible";
        document.querySelector("#colorLapiz").style.visibility = "visible";    
        changeToCursor1();
        herramientas(dibujando);
    }
    //Activa la goma y desactiva el lapiz
    function gomaBorrar(){
        let borrando = false;
        lapizActivo = false;
        gomaActiva = true;
        desactivarRangosyLabel()
        document.querySelector("#labelGoma").style.visibility = "visible";      
        document.querySelector("#rangogoma").style.visibility = "visible";
        changeToCursor1();
        herramientas(borrando);
    }
    //Oculta los rangos y paleta del lapiz para una interfaz mas amigable.
    function desactivarRangosyLabel(){
        document.querySelector("#labelGoma").style.visibility = "hidden";
        document.querySelector("#labelLapiz").style.visibility = "hidden";
        document.querySelector("#labelContraste").style.visibility = "hidden";
        document.querySelector("#labelBrillo").style.visibility = "hidden";
        document.querySelector("#rangogoma").style.visibility = "hidden";      
        document.querySelector("#rangocontraste").style.visibility = "hidden";        
        document.querySelector("#rangobrillo").style.visibility = "hidden";
        document.querySelector("#colorLapiz").style.visibility = "hidden";
    }

    canvasNuevo();
    document.querySelector('#nuevo').addEventListener('click',canvasNuevo);
    document.querySelector("#guardar").addEventListener("click",descargar);

    document.querySelector("#filtrogris").addEventListener('click',aplicarFiltroGris);
    document.querySelector("#filtronegativo").addEventListener('click',aplicarFiltroNegativo);
    document.querySelector("#filtrosepia").addEventListener('click',aplicarFiltroSepia);
    document.querySelector("#filtrobinario").addEventListener('click',aplicarFiltroBinario);
    document.querySelector("#filtroBlur").addEventListener('click',aplicarFiltroBlur);
    
    document.querySelector("#lapiz").addEventListener('click',dibujar);
    document.querySelector("#goma").addEventListener('click',gomaBorrar);

    document.querySelector("#brillo").addEventListener('click',cambiarBrillo);
    document.querySelector("#contraste").addEventListener('click',cambiarContraste);
    document.querySelector("#rangocontraste").addEventListener('change',cambiarContraste);
    document.querySelector("#rangobrillo").addEventListener('change',cambiarBrillo);
})