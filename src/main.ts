import {SimpleSurfaceData} from './surface-data';
import {Sinc} from './math-func';
import {CreateSurfaceWithColormap, LightInputs} from './surface';
import $ from 'jquery';

const CreateSurface = async (
    li:LightInputs
    , isAnimation = true
    , colormapName = 'jet'
    , scale = 2
    , scaley = 0
) => {
    const data = SimpleSurfaceData(
        Sinc
        , -8
        , 8
        , -8
        , 8
        , 30
        , 30
        , scale
        , scaley
        , colormapName
    );

    await CreateSurfaceWithColormap(
        data?.vertexData!
        , data?.normalData!
        , data?.colorData!
        , li
        , isAnimation
    );
}

let li:LightInputs = {};
let isAnimation = true;
let colormapName = 'jet';
let scale = 2;
let scaley = 0.3;

CreateSurface(li, isAnimation, colormapName, scale, scaley);

$('#id-radio input:radio').on('click', function() {
    let val = $('input[name="options"]:checked').val();

    if(val === 'animation') {
        isAnimation = true;
    }
    else {
        isAnimation = false;
    }

    CreateSurface(li, isAnimation, colormapName, scale, scaley);
});

$('#btn-redraw').on('click', function() {
    li.isTwoSideLighting = parseFloat(
        $('#id-istwoside').val()?.toString()!
    );

    scale = parseFloat($('#id-scale').val()?.toString()!);
    scaley = parseFloat($('#id-scaley').val()?.toString()!);

    CreateSurface(li, isAnimation, colormapName, scale, scaley);
});

$('#id-colormap').on('change', function() {
    const ele = this as any;

    colormapName = ele.options[ele.selectedIndex].text;

    CreateSurface(li, isAnimation, colormapName, scale, scaley);
});

window.addEventListener('resize', function() {
    CreateSurface(li, isAnimation, colormapName, scale, scaley);
})