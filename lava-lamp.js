import * as THREE from "three";

// A continuous wax surface: smooth unions let the rising blobs join and pull apart.
// Ray marching stays inside this small bottle, so it adds no full-screen pass.
export function createLavaLamp(parent) {
  const lamp = new THREE.Group();
  lamp.position.set(-4.65, 2.31, -0.95);
  parent.add(lamp);
  const metal = new THREE.MeshStandardMaterial({
    color: "#6b7770",
    metalness: 0.82,
    roughness: 0.28,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: "#25332a",
    roughness: 0.65,
  });
  const lathe = (profile, material) => {
    const mesh = new THREE.Mesh(
      new THREE.LatheGeometry(
        profile.map((p) => new THREE.Vector2(...p)),
        64,
      ),
      material,
    );
    mesh.castShadow = mesh.receiveShadow = true;
    lamp.add(mesh);
    return mesh;
  };
  lathe(
    [
      [0, 0],
      [0.43, 0],
      [0.44, 0.055],
      [0.42, 0.1],
      [0.25, 0.39],
      [0.27, 0.46],
      [0.34, 0.54],
      [0.34, 0.59],
      [0, 0.59],
    ],
    metal,
  );
  lathe(
    [
      [0.41, 0.01],
      [0.44, 0.01],
      [0.44, 0.045],
      [0.41, 0.045],
    ],
    dark,
  );
  lathe(
    [
      [0, 2.52],
      [0.175, 2.52],
      [0.18, 2.59],
      [0.13, 2.83],
      [0.08, 2.89],
      [0, 2.89],
    ],
    metal,
  );
  const glass = lathe(
    [
      [0.31, 0.55],
      [0.35, 0.64],
      [0.37, 0.85],
      [0.35, 1.15],
      [0.29, 1.7],
      [0.225, 2.2],
      [0.165, 2.55],
    ],
    new THREE.MeshPhysicalMaterial({
      color: "#a4e7b1",
      transparent: true,
      opacity: 0.16,
      roughness: 0.1,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  glass.castShadow = false;
  glass.renderOrder = 2;
  // A narrow curved reflection makes the bottle read as glass in daylight too.
  const reflection = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.353, 0.68),
        new THREE.Vector2(0.373, 0.85),
        new THREE.Vector2(0.353, 1.15),
        new THREE.Vector2(0.293, 1.7),
        new THREE.Vector2(0.228, 2.2),
        new THREE.Vector2(0.168, 2.5),
      ],
      32,
      -0.48,
      0.08,
    ),
    new THREE.MeshBasicMaterial({
      color: 0xeaffee,
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  reflection.renderOrder = 3;
  lamp.add(reflection);
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uEye: { value: new THREE.Vector3() } },
    vertexShader: `varying vec3 vPoint;
      void main(){ vPoint=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `precision highp float;
      varying vec3 vPoint;
      uniform float uTime;
      uniform vec3 uEye;
      float blend(float a,float b,float k){float h=max(k-abs(a-b),0.0)/k;return min(a,b)-h*h*k*0.25;}
      float wax(vec3 p){
        float d=length((p-vec3(0.0,-1.06,0.0))/vec3(1.0,0.7,1.0))-0.39;
        d=blend(d,length(p-vec3(0.0,1.04,0.0))-0.17,0.1);
        for(int i=0;i<6;i++){
          float f=float(i), phase=uTime*(0.23+f*0.017)+f*1.71;
          float y=0.82*sin(phase);
          float r=0.115+0.022*sin(f*2.7+0.8);
          vec3 center=vec3(sin(phase*0.73+f)*0.095,y,cos(phase*0.61+f*2.0)*0.075);
          vec3 q=p-center;
          q.y/=1.16+0.32*cos(phase*2.0);
          float blob=length(q)-r;
          d=blend(d,blob,0.115);
        }
        float h=clamp((p.y+0.98)/1.96,0.0,1.0);
        float wall=length(p.xz)-(mix(0.33,0.15,h)+0.055*sin(h*3.14159));
        return max(d,max(wall,abs(p.y)-0.98));
      }
      void main(){
        vec3 ray=normalize(vPoint-uEye),p=vPoint;
        float travel=0.0; bool found=false;
        for(int j=0;j<80;j++){
          float d=wax(p);
          if(d<0.0018){found=true;break;}
          travel+=max(d*0.72,0.003); p=vPoint+ray*travel;
          if(travel>2.3 || abs(p.y)>1.06 || length(p.xz)>0.49)break;
        }
        if(!found)discard;
        vec2 e=vec2(0.002,0.0);
        vec3 n=normalize(vec3(wax(p+e.xyy)-wax(p-e.xyy),wax(p+e.yxy)-wax(p-e.yxy),wax(p+e.yyx)-wax(p-e.yyx)));
        vec3 light=normalize(vec3(-0.5,0.7,1.0));
        float diffuse=max(dot(n,light),0.0),rim=pow(1.0-max(dot(n,-ray),0.0),2.0);
        float spec=pow(max(dot(reflect(-light,n),-ray),0.0),24.0);
        vec3 color=mix(vec3(0.005,0.12,0.008),vec3(0.12,0.65,0.015),diffuse*0.75+0.2);
        color+=vec3(0.03,0.25,0.005)*rim+vec3(0.3,0.65,0.12)*spec*0.5;
        gl_FragColor=vec4(color,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const wax = new THREE.Mesh(new THREE.BoxGeometry(0.86, 2.1, 0.86), material);
  wax.position.y = 1.55;
  lamp.add(wax);
  const light = new THREE.PointLight(0x7aff42, 3, 4, 2);
  light.position.set(-4.65, 3.4, -0.65);
  parent.add(light);
  let night = false;
  return {
    update(time, camera, reduced) {
      const t = reduced ? 7 : time / 1000;
      material.uniforms.uTime.value = t;
      wax.updateWorldMatrix(true, false);
      material.uniforms.uEye.value.copy(camera.position);
      wax.worldToLocal(material.uniforms.uEye.value);
      light.intensity = (night ? 5 : 2.2) * (1 + Math.sin(t * 0.4) * 0.06);
    },
    setNight(value) {
      night = value;
    },
  };
}
