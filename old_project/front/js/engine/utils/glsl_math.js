"use strict"

export default class GMath {
    static radians(degrees){
        //Convert a quantity in degrees to radians
        return Math.PI*degrees/180.0;
    }

    static degrees(radians){
        //Convert a quantity in radians to degrees
        return 180.0*radians/Math.PI;
    }

    static inversesqrt(x){
        //Return the inverse of the square root of the parameter
        return 1./Math.sqrt(x);
    }
    static fract(x){
        //Compute the fractional part of the argument
        return x - Math.floor(x);
    }
    static mod(x, y){
        //Compute the value of x modulo y
        //Have some sign differences with js modulo operator `%`
        return x - y * Math.floor(x/y);
    }
    static clamp(mainVal, minVal, maxVal){
        //Constrain a value to lie between two further values
        return Math.max(minVal, Math.min(mainVal, maxVal));
    }
    static mix(fromVal, toVal, a){
        //Performs a linear interpolation between x and y using a to weight between them
        return fromVal*(1 - a) + toVal*a;
    }
    static step(edge, x){
        //Generates a step function by comparing x to edge
        return (x<edge) ? 0.0 : 1.0;
    }
    static smoothstep(minEdge, maxEdge, x){
        //Perform Hermite interpolation between two values
        const t = Math.clamp((x - minEdge) / (maxEdge1 - minEdge), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    }
    static length(v){
        //Calculate the length of a vector
        return Math.hypot(...v);
    }
    static distance(v1, v2){
        //Calculate the distance between two vector points
        return Math.hypot(...v1.map((v1_value, index) => v1_value - v2[index] ))
    }
    static vecadd(v1, v2){
        //Calculate the dot product of two vectors
        return v1.map((vi, i) => vi+v2[i]);
    }
    static vecsub(v1, v2){
        //Calculate the dot product of two vectors
        return v1.map((vi, i) => vi-v2[i]);
    }
    static scale(v, scale){
        //Calculate the dot product of two vectors
        return v.map((vi, i) => vi*scale);
    }
    static dot(v1, v2){
        //Calculate the dot product of two vectors
        return v1.reduce((accumulator, v1_value, index) => accumulator + v1_value*v2[index] )
    }
    static cross(v1, v2){
        //Calculate the cross product of two 3-component vectors
        return [
            v1[1] * v2[2] - v1[2] * v2[1], //x
            v1[2] * v2[0] - v1[0] * v2[2], //y
            v1[0] * v2[1] - v1[1] * v2[0], //z
        ]
    }
    static normalize(v){
        //Calculate the unit vector in the same direction as the input vector
        const length = Math.hypot(...v);
        return v.map((vi) => vi/length);
    }
    static faceforward(vecN,vecI,Nref){
        //faceforward() orients a vector to point away from a surface as defined by its normal.
        //If dot(Nref, I) < 0 faceforward returns N, otherwise it returns -N.
        const sign = Math.sign(Math.dot(Nref, vecI));
        return vecN.map((val) => -sign*val);
    }
    static reflect(vecI, vecN){
        //For a given incident vector I and surface normal N reflect
        //returns the reflection direction calculated as I - 2.0 * dot(N, I) * N.
        //
        //N should be normalized in order to achieve the desired result.
        const calcDot = Math.dot(vecN, vecI);
        return vecI.map((vecI_val, index) => vecI_val - 2.0*calcDot*vecN[index]);
    }
    static refract(vecI, vecN, eta){
        //For a given incident vector I, surface normal N
        //and ratio of indices of refraction - eta,
        //refract returns the refraction vector R.
        //
        //The input parameters I and N should be normalized in order to achieve the desired result.
        const calcDot = Math.dot(vecN, vecI);
        const k = 1.0 - eta * eta * (1.0 - calcDot * calcDot);
        if(k < 0.0) return vecI.constructor(vecI.length)
        return vecI.map((vecI_val, index) => eta * vecI_val - (eta * calcDot + Math.sqrt(k)) * vecN[index])
    }
    /**
     * @param {Mat4} mat 
     * @param {Vec4} vec 
     * @return {Vec4}
     */
    static mat4vec4multiply(mat, vec) {
        // return [
        //     mat[0]  * vec[0] + mat[4]  * vec[1] + mat[8]  * vec[2] + mat[12]  * vec[3],
        //     mat[1]  * vec[0] + mat[5]  * vec[1] + mat[9]  * vec[2] + mat[13]  * vec[3],
        //     mat[2]  * vec[0] + mat[6]  * vec[1] + mat[10] * vec[2] + mat[14] * vec[3],
        //     mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15] * vec[3],
        // ]
        return [
            mat[0]  * vec[0] + mat[1]  * vec[1] + mat[2]  * vec[2] + mat[3]  * vec[3],
            mat[4]  * vec[0] + mat[5]  * vec[1] + mat[6]  * vec[2] + mat[7]  * vec[3],
            mat[8]  * vec[0] + mat[9]  * vec[1] + mat[10] * vec[2] + mat[11] * vec[3],
            mat[12] * vec[0] + mat[13] * vec[1] + mat[14] * vec[2] + mat[15] * vec[3],
        ]
    }
}
