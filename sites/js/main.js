document.addEventListener ("DOMContentLoaded", function(){

    let canvas = document.querySelector("#canvas");
    let ctx = canvas.getContext("2d");
    let input = document.querySelector('#inputGroupFile01');
    //Creo estas variables para guardar el tamaño original del canvas.
    let cw = canvas.width;
    let ch = canvas.height;
    let dataImgAnterior;
    let filtroAplicado = false;

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

    //Verifica si hay un filtro aplicado, para no aplicar uno sobre otro, utilizando la imagen original.
    function verificarFiltro(){
        if (filtroAplicado){
          ctx.putImageData(dataImgAnterior,0,0);
        }else{
          filtroAplicado = true;
        }
      }
    //Aca utilizo 3 funciones generales, para el RGB.
    function getRed(index,imageData){
        return  imageData.data[index + 0];
    }
    
    function getGreen(index,imageData){
        return  imageData.data[index + 1];
    }
        
    function getBlue(index,imageData){
        return  imageData.data[index + 2];
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

    canvasNuevo();
    document.querySelector('#nuevo').addEventListener('click',canvasNuevo);
    document.querySelector("#guardar").addEventListener("click",descargar);
    document.querySelector("#filtrogris").addEventListener('click',aplicarFiltroGris);
    document.querySelector("#filtronegativo").addEventListener('click',aplicarFiltroNegativo);
    document.querySelector("#filtrosepia").addEventListener('click',aplicarFiltroSepia);
    document.querySelector("#filtrobinario").addEventListener('click',aplicarFiltroBinario);
})