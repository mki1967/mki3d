MKI 3D RAPID MODELER  
==================== 

Author: Marcin Kik <mki1967@gmail.com>
Project can be found on: https://github.com/mki1967/mki3d

Project GitHub Page is available at: http://mki1967.github.io/mki3d/

MKI 3D RAPID MODELER is a keyboard-driven Chrome application 
for creating simple 3D models consisting of colored line segments and triangles.

<a target="_blank" href="https://chrome.google.com/webstore/detail/mki3d/bmoccdhfglkopghfkecppindffakhcbe">
Link for installation from Chrome Web Store.
</a>

The program evolves towards the functionality of 
https://github.com/mki1967/et-edit
However, the underlying data structures, file formats,
and user interface are being redesigned:

- Data structure is less 'parsimonious'. In particular, each element (line segment or triangle) has its own endpoints.
  Thus, the data size is the total number of endpoints in all triangles and segments plus some constant number
  of configuration parameters.

- File format is JSON of the data that can be easily  manipulated by other applications.

- The general rule of the user interface is that the possible key-press actions
  are displayed to the user by the means of hierarchical menus. 
  There is only small set of key-press actions that has to be initially memorized by the user
  (moving the cursor, rotating the screen and so on ...)

It is Chrome application that requires WebGL.
It should be portable across modern computers and operating systems.  

To use the version from repository:

- clone the repository to your disk:
      git clone https://github.com/mki1967/mki3d.git

- load the app to your Chrome browser according to instructions on the page:
     https://developer.chrome.com/extensions/getstarted#unpacked
  (The application is in the sub-directory mki3d_www of the repository.
   Load this sub-directory.)

- start the application and press 'H' key to read the instructions
  and general description of the program


WARNINGS: 
---------

This project is at early stage of development.
Protect your work by frequent saving.
The 'undo' operation is still not implemented.
Many needed features are still to be implemented.

You may expect some changes in future versions: 

- user interface:
   The key-press sequences for the operations may need to be updated in future versions.
   Observe the menus and messages on the screen and refer to the Help Page (press 'H').

- Data format in the file may also change. 
  Although, it is and will be JSON and the references defining the model's shape, 
  colors and set-partition of the endpoints
  shall remain in its current format. 
  So your data should be easily recoverable.  









 
