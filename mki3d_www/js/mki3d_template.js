/* template strings needed for application */
mki3d.template={};
/*jshint multistr: true */
mki3d.template.exportedHtml="\
<!DOCTYPE html > \
<html id=\"#htmlId\" style=\"overflow: hidden;\"> \
  <body> \
    <div id=\"divCanvas\" style=\"position: relative;\"> \
      <canvas id=\"canvasId\" style=\"border:0px; margin: 0px; padding: 0px;\" > \
	Your browser does not support the canvas element. \
      </canvas> \
      <div id=\"divUpperMessage\" style=\"position: absolute; top: 0px; left: 0px; color: black; background-color: white;\"> \
	DIRECTIONS:\
        <button type=\"button\" id=\"leftButton\"> LEFT </button> \
	<button type=\"button\" id=\"upButton\"> UP </button> \
	<button type=\"button\" id=\"backButton\"> BACK </button> \
	<button type=\"button\" id=\"forwardButton\"> FORWARD </button> \
	<button type=\"button\" id=\"downButton\"> DOWN </button> \
	<button type=\"button\" id=\"rightButton\"> RIGHT </button> \
	ACTIONS: \
 	<button type=\"button\" id=\"rotateButton\"> ROTATE </button> \
	<button type=\"button\" id=\"moveButton\"> MOVE </button> \
	<button type=\"button\" id=\"scaleUpButton\"> SCALE UP </button> \
	<button type=\"button\" id=\"scaleDownButton\"> SCALE DOWN </button> \
	<button type=\"button\" id=\"alignButton\"> ALIGN </button> \
	<button type=\"button\" id=\"resetButton\"> RESET </button> \
	<a href=\"https://github.com/mki1967/mki3d\"> INFO </a> \
      </div> \
    </div> \
    <script src=\"mki3d_view.js\"> \
    </script> \
    <script> \
      mki3d.exported= {/* replace */} \
    </script> \
  </body> \
</html>";
