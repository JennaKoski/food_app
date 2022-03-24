import { FetchWrapper } from "./fetch-wrapper";
import snackbar from "snackbar";
import "snackbar/dist/snackbar.min.css";
import Chart from "chart.js/auto";

const form = document.querySelector("form");
const ctx = document.getElementById("myChart").getContext("2d");
const totalCal = document.querySelector(".totalCal");
const foodSummary = document.querySelector(".box_summary");
// const add = document.querySelector(".addButton");
let myChart;

const API = new FetchWrapper(
  "https://firestore.googleapis.com/v1/projects/programmingjs-90a13/databases/(default)/documents/"
);

const chartTotal = (carbs, protein, fat) => {
  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Carbs", "Protein", "Fat"],
      datasets: [
        {
          label: "Macronutrients",
          data: [carbs, protein, fat],
          backgroundColor: [
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

const postFoods = (protein, fat, carbs, foodSelection) => {
  let body = {
    fields: {
      protein: {
        integerValue: protein,
      },
      fat: {
        integerValue: fat,
      },
      carbs: {
        integerValue: carbs,
      },
      foodSelection: {
        stringValue: foodSelection,
      },
    },
  };
  return API.post("jenna456", body);
};

const getFoods = () => {
  API.get("jenna456").then((data) => {
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;
    if (data.documents) {
      data.documents.forEach((document) => {
        totalCarbs = Number(document.fields.carbs.integerValue) + totalCarbs;
        totalProtein =
          Number(document.fields.protein.integerValue) + totalProtein;
        totalFat = Number(document.fields.fat.integerValue) + totalFat;
        let caloriesTotal =
          Number(totalCarbs) * 4 +
          Number(totalProtein) * 4 +
          Number(totalFat) * 9;
        totalCal.innerHTML = `${caloriesTotal}`;
      });
      chartTotal(totalCarbs, totalProtein, totalFat);

      foodSummary.innerHTML = data.documents
        .map(
          (document) => `<div class="summary"> <h3>${
            document.fields.foodSelection.stringValue
          }</h3>
      <p> Total ${
        Number(document.fields.carbs.integerValue) * 4 +
        Number(document.fields.fat.integerValue) * 9 +
        Number(document.fields.protein.integerValue) * 4
      } kcal </p>
      <div class="info">
        <div class="carbsEnd">
          <p>Carbs</p>
          <p> ${document.fields.carbs.integerValue}g</p>
        </div>
        <div class="proteinEnd">
          <p>Protein</p>
          <p> ${document.fields.protein.integerValue}g</p>
        </div>
        <div class="fatEnd">
          <p>Fat</p>
          <p> ${document.fields.fat.integerValue}g</p>
        </div>
      </div>
      </div>`
        )
        .join("");
    }
  });
};

const finale = (e) => {
  e.preventDefault();
  const carbs = document.querySelector(".carbs").value;
  const protein = document.querySelector(".protein").value;
  const fat = document.querySelector(".fat").value;
  const foodSelection = document.querySelector(".foodSelection").value;

  if (foodSelection !== "Select your food" && carbs && protein && fat) {
    if (myChart) {
      myChart.destroy();
    }
    postFoods(carbs, protein, fat, foodSelection).then(() => {
      getFoods();
    });
    snackbar.show("😋");
  }
};

getFoods();
form.addEventListener("submit", finale);
