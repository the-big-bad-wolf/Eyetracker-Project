import numpy as np
import warnings
from crunch.forecasting.arma import ARMAClass
from crunch.forecasting.garch import GARCHClass
from crunch.forecasting.plotting import Plotting

# Ignore warnings
# Fryktelig mange warnings fra AIC-estimeringen
warnings.filterwarnings("ignore")


class CognitiveLoadPredictor:
    """
    A class to predict cognitive load using the ARIMA model ARIMA(p,d,q).
    Due to stationarity in the data we use ARMA model, which is a special case of ARIMA, where d=0.

    Attributes:
    - data (numpy.array): The array of cognitive load data.
    - p (int): The AR order for the ARIMA model.
    - q (int): The MA order for the ARIMA model.
    - model (ARIMA): The ARIMA model instance.
    - model_fit (ARIMA): The fitted ARIMA model.
    """

    def __init__(self, initial_data):
        """
        Initializes the CognitiveLoadPredictor with initial data.

        Parameters:
        - initial_data (numpy.array): The initial array of cognitive load data.
        """
        self.raw_data = initial_data
        self.mean_initial = np.mean(initial_data)
        self.std_initial = np.std(initial_data)
        self.standardized_data = self.standardize(initial_data)
        self.ARMAClass = ARMAClass(self.standardized_data)
        self.Plotting = Plotting()
        self.GARCHClass = GARCHClass(self.standardized_data)

    def standardize(self, data):
        return (data - self.mean_initial) / self.std_initial

    def update_and_predict(self, new_value):
        standardized_value = self.standardize(new_value)
        arma_forecast, is_outlier = self.ARMAClass.update_and_predict(
            standardized_value
        )
        garch_forecast = self.GARCHClass.update_and_predict(
            self.ARMAClass.get_residuals()
        )
        # option to use results from ARMA and GARCH separately
        # garch_result = self.mean_initial + standard_deviation_forecast
        # arima_result = forecast
        arima_and_garch_combined_forecast = arma_forecast + garch_forecast

        print("ARMA: ", arma_forecast, "Garch: ", garch_forecast)

        self.standardized_data = np.append(self.standardized_data, standardized_value)
        self.Plotting.plot(self.standardized_data, arima_and_garch_combined_forecast)
        self.Plotting.backtest(standardized_value, arima_and_garch_combined_forecast)

        return arma_forecast, is_outlier

    def combined_forecast(self, time_series):
        # Step 1: Fit ARIMA model
        arima_model = self.ARMAClass(time_series)
        arima_model.fit()  # Assuming a method that fits the model exists or is integrated in your constructor

        # Step 2: Extract residuals
        residuals = arima_model.get_residuals()

        # Step 3: Fit GARCH model
        garch_model = self.GARCHClass(
            residuals
        )  # This initialization might be different based on your actual GARCH class design
        garch_model.fit()  # Assuming a method that fits the model exists or is integrated in your constructor

        # Step 4: Forecasting
        # This step is hypothetical and depends on how your forecast methods are structured.
        # It assumes you're forecasting one step ahead.
        arima_forecast = arima_model.forecast()
        garch_forecast = garch_model.forecast()

        # The 'combined_result' could be a tuple, dictionary, or a custom object that holds the forecasted value and volatility.
        # This is a simplified representation; you might need additional logic based on your forecasting requirements.
        combined_result = {
            "mean": arima_forecast,  # The forecasted future value
            "volatility": garch_forecast,  # The forecasted volatility
        }

        return combined_result
