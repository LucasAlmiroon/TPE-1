document.addEventListener ("DOMContentLoaded", function(){

    let canvas = document.querySelector("#canvas");
    let ctx = canvas.getContext("2d");
    let input = document.querySelector('#inputGroupFile01');
    //Uso estas variables para guardar el tamaño original del canvas.
    let cw = canvas.width;
    let ch = canvas.height;

    function canvasNuevo(){
        //Limpia el input, limpia el imagedata y genera un canvas nuevo.
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

    canvasNuevo();
    document.querySelector('#nuevo').addEventListener('click',canvasNuevo);
    document.querySelector("#guardar").addEventListener("click",descargar);
})