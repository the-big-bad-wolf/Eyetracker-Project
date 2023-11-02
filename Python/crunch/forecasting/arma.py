import warnings
import numpy as np
from statsmodels.tsa.arima.model import ARIMA


warnings.filterwarnings("ignore")


class ARMAClass:
    def __init__(self, data , p=3, q=5, baseline_length=10):
        self.p, self.q = self.estimate_order(data)
        self.model = ARIMA(data, order=(self.p, 0, self.q))
        self.model_fit = self.model.fit()
        self.counter = 0
        self.forecast_matrix = np.zeros((10, 10))  # 10 forecasts, 10 values each
        self.averages = []  # To store the average forecasts

    def estimate_order(self, history):
        """
        Estimates the AR and MA order (p and q) for the ARIMA model based on AIC, Akaike information criterion
        https://en.wikipedia.org/wiki/Akaike_information_criterion
        Returns:
        - tuple: A tuple containing the estimated p and q values.
        """
        best_aic = np.inf
        best_order = None

        for p in range(2, 6):
            for q in range(2, 6):
                try:
                    model = ARIMA(history, order=(p, 0, q))
                    model_fit = model.fit()
                    aic = model_fit.aic
                    if aic < best_aic:
                        best_aic = aic
                        best_order = (p, q)
                except:
                    continue
        print(f"Best order: {best_order}")
        return best_order

    def update_and_predict(self, history):
        """
        Updates the model with a new cognitive load value and predicts the next value.

        Parameters:
        - history (np.list): The historical values used to make forecast.

        Returns:
        - forecast: The array of forecasted cognitive load values.
        """

        if self.counter == 41:
            self.counter = 0
            self.estimate_order(history)
        self.counter += 1
        self.model = ARIMA(history, order=(self.p, 0, self.q))
        self.model_fit = self.model.fit()

        forecast = self.model_fit.forecast(steps=10)
        
        # Update the forecast matrix with the new forecast
        self.forecast_matrix = np.roll(self.forecast_matrix, -1, axis=0)
        self.forecast_matrix[-1, :] = forecast
        
        # Calculate and store the average forecast
        average_forecast = np.mean(self.forecast_matrix, axis=0)
        self.averages.append(average_forecast)
        return forecast

    def get_residuals(self):
        """
        Retrieve the residuals from the fitted ARIMA model.

        Returns:
        --------
        np.ndarray
            The residuals from the fitted model.
        """
        return self.model_fit.resid

