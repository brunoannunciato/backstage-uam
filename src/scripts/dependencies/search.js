'use strict';

module.exports = function () {
    var campoFiltro = document.querySelector("#search");

    campoFiltro.addEventListener("input", function () {
        var bands = document.querySelectorAll(".band");

        if (this.value.length > 0) {
            for (var i = 0; i < bands.length; i++) {
                var band = bands[i];
                var bandTitle = band.querySelector(".band-title");
                var nome = bandTitle.textContent;
                var expressao = new RegExp(this.value, "i");

                if (!expressao.test(nome)) {
                    band.classList.add("hidden");
                } else {
                    band.classList.remove("hidden");
                }
            }
        } else {
            for (var i = 0; i < bands.length; i++) {
                var band = bands[i];
                band.classList.remove("hidden");
            }
        }

        console.log (campoFiltro.value);
    });
}