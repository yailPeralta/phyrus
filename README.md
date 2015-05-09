# phyrus
A simple library to make ajax request with XMLHttpRequest 2 and upload files easily

Example
-------

```javascript

  // ajax request when a form is submited
  ///////////////////////////////////////
  var form = document.querySelector('#form');

  form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      // also you could write it like this p.ajax() 
      phyrus.ajax()

          .request({
              url: 'testPost.php',
              method: 'POST',
              data: new FormData(e.target)
          })
          //success callback
          .then(function (response) {
              console.log(response);
          })
          //error callback
          .catch(function (response) {
              console.log(response);
          });

  });
  
  // when upload files with input type file
  //////////////////////////////////////////
  document.querySelector('input[type="file"]').addEventListener('change', function(e) {

     phyrus.uploadFiles(this.files)
     .into('test.php')
     .then(function (response) {
        console.log(response);
     })
     .catch(function(response){
        console.log(response)
     });

  }, false);
  
  // or we can do the same like this, if we put a 
  // data-uploadfiles attribute in the input type file
  ////////////////////////////////////////////////////
  phyrus.uploadFiles({
      success: function (e) {
          console.log("custom success callback");
      },
      //error
      error: function (e) {
          console.log("custom error callback");
      }
  }).into('test.php');
  
  // when we want to use drag and drop to upload files
  ////////////////////////////////////////////////////
  var dropzone = document.querySelector('.dropzone');

  // events listeners
  dropzone.addEventListener("dragover", function (e) {

      e.preventDefault(e);
      e.target.classList.add('drop-active');

  }, false);

  dropzone.addEventListener("dragenter", function (e) {

      //e.preventDefault(e);
      e.target.classList.add('drop-active');

  }, false);


  dropzone.addEventListener("dragleave", function (e) {

      //e.preventDefault(e);
      e.target.classList.remove('drop-active');
      e.target.classList.remove('drop-target');

      if(_isDefined(options.ondragleave) && _isFunction(options.ondragleave)){
          options.ondragleave(e);
      }
  }, false);

  dropzone.addEventListener("drop", function (event) {

      event.preventDefault();
      event.target.classList.remove('drop-active');

      // get the files
      var files = event.dataTransfer.files;


      phyrus.uploadFiles( files )
          // target
          .into('test.php')
          // promises
          .then(function (response) {
              console.log(response);
          })
          .catch(function(response){
              console.log(response)
          });

  }, false);


       


