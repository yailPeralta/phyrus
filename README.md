# phyrus
A simple library to make ajax request with XMLHttpRequest 2 and upload files easily

Example
-------

```javascript
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


