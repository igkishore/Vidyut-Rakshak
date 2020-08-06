function validate() {
  var x = document.forms["myForm"]["email"].value;
  console.log(v)
  if (x == "") {
    alert("Name must be filled out");
    return false;
  }
}