import {CreateShapeWithLight, LightInputs} from './surface';
import {CubeData} from './vertex-data';
import $ from 'jquery';
import "./site.css"

const data = CubeData();
let li:LightInputs = {};
let isAnimation = true;

CreateShapeWithLight(data.positions, data.normals, li, isAnimation);

$('#id-radio input:radio').on('click', function() {
    let val = $('input[name="options"]:checked').val();

    if(val === 'animation') {
        isAnimation = true;
    }
    else {
        isAnimation = false;
    }

    CreateShapeWithLight(data.positions, data.normals, li, isAnimation);
});

$('#btn-redraw').on('click', function() {
    li.color = ($('#id-color').val()?.toString())
        ?.split(',')
        .map(Number) as any;

    li.ambientIntensity = parseFloat($('#id-ambient').val()?.toString()!);
    li.diffuseIntensity = parseFloat($('#id-diffuse').val()?.toString()!);

    li.specularIntensity = parseFloat(
        $('#id-specular').val()?.toString()!
    );

    li.shininess = parseFloat($('#id-shininess').val()?.toString()!);

    li.specularColor = ($('#id-scolor').val()?.toString())
        ?.split(',')
        .map(Number) as any;

    CreateShapeWithLight(data.positions, data.normals, li, isAnimation);
});

window.addEventListener('resize', function() {
    CreateShapeWithLight(data.positions, data.normals, li, isAnimation);
})