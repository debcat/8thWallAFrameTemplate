let demo = null;

AFRAME.registerComponent('shadow-material', {
  init() {
    this.material = new THREE.ShadowMaterial();
    this.el.getOrCreateObject3D('mesh').material = this.material;
    this.material.opacity = 0.4;
  }
});

AFRAME.registerComponent('loading-screen', {
  init: function () {
    const scene = this.el.sceneEl
    document.fullscreenEnabled = true;
    const reasons = XR.XrDevice.incompatibleReasonsDetails;
    const device = XR.XrDevice.deviceEstimate();
    const loadingImg = document.getElementById(`loadingImg`);

    scene.addEventListener('realityready', () => {
      loadingScreen.style.display = 'none';
      promptImage.style.visibility = 'visible';      
    })

    scene.addEventListener('realityerror', () => {
      if (!XR.XrDevice.isDeviceBrowserCompatible()) {
        if (device.os != "iOS" && device.os != "Android") {
          loadingImg.src = "graphics/DesktopScreen.jpg";
          desktopImgForeground.style.visibility = 'visible';
        } else if (XR.XrDevice.IncompatibilityReasons.UNSUPPORTED_BROWSER) {
          loadingImg.src = "graphics/AlmostThere.jpg";
        } else {
          loadingImg.src = "graphics/Error.jpg";
        }
      }
    })
    
  }
});

// Component that places model where the ground is clicked
AFRAME.registerComponent('tap-place', {
  init: function () {
    const ground = document.getElementById('ground');
    const promptImage = document.getElementById('promptImage');
    const ctaImage = document.getElementById('ctaImage');
    const scene = this.el.sceneEl;    
    
    ground.addEventListener('click', event => {      
      // Create new entity for the new object
      if (demo === null) {
        scene.removeAttribute('tap-place');
        demo = document.createElement('a-entity');
        demo.setAttribute('pinch-scale', '');
        demo.setAttribute('shadow', 'cast: true');
        demo.setAttribute('visible', false);
        demo.setAttribute('scale', '4.5 4.5 4.5');
        demo.setAttribute('gltf-model', '#demoModel');
        this.el.sceneEl.appendChild(demo);
        promptImage.style.visibility = "hidden";
        setTimeout(() => {
          ctaImage.style.visibility = 'visible';
        }, 10000);
      }

      // The raycaster gives a location of the touch in the scene
      const touchPoint = event.detail.intersection.point
      demo.setAttribute('position', touchPoint);

      demo.addEventListener('model-loaded', () => {        
        // Once the model is loaded, we are ready to show it
        var demoSound = document.querySelector('#demoAudio');
        demoSound.components.sound.playSound();
        demo.setAttribute('visible', true)
        demo.setAttribute('animation-mixer', { clip: 'Animation', loop: 'repeat' });
        
      })
      
    });
  }
});


AFRAME.registerComponent('req-camera-permissions', {
  init: function () {
    const scene = this.el.sceneEl
    console.log('in req camera permissions');
    XR.addCameraPipelineModule({
      name: 'camerastartupmodule',
      onCameraStatusChange: ({ status }) => {
        console.log(status)
        if (status == 'requesting' && XR.XrDevice.deviceEstimate().os != 'Android') {
          console.log("in req-camera-permissions requesting")
          // loadingImg.src = "graphics/CameraPrompt.jpg";
        } else if (status == 'hasStream') {
          loadingImg.src = "graphics/LoadingScreen.jpg"
        } else if (status == 'failed') {
          loadingImg.src = "graphics/CancelCamera.jpg"
        }
      },
    });
    if (window.orientation != 0) {
      loadingImg.src = "graphics/Landscape.jpg";
      // loadingImg.style.width = 'auto';
      loadingImg.style.height = '95%';
      console.log(window.orientation)
    } else {
      loadingImg.src = "graphics/LoadingScreen.jpg";
      scene.setAttribute('xrweb', '');

    }
  }
});


AFRAME.registerComponent('camera-orientation', {
  init: function () {
    console.log('in camera orientation module')
    XR.addCameraPipelineModule({
      name: 'screenorientation',
      onDeviceOrientationChange: ({ GLctx, videoWidth, videoHeight, orientation }) => {
        console.log("in camera orientation module")
        if (orientation != 0) {
          loadingImg.src = "graphics/Landscape.jpg";
          loadingImg.style.height = '80%';
          loadingScreen.style.display = 'block';
        } else if (orientation == 0) {
          loadingScreen.style.display = 'none';
        }
      },
    })
  }
});

AFRAME.registerComponent('devicemotion-checker', {
  init: function () {
    console.log("in devicemotion module")
    let hasMotionEvents = false
    const motionListener = () => {
      hasMotionEvents = true
      window.removeEventListener('devicemotion', motionListener)
    }
    window.addEventListener('devicemotion', motionListener)

    this.el.addEventListener('realityready', () => {
      if (!hasMotionEvents) {
        console.log("show image")
        document.getElementById('gyroSettings').style.display = 'block'
        XR.pause()
        XR.stop()
      }
    })
  }
})
