import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Package } from 'lucide-react';

const DemandForecasting = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('email');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/forecast?email=${email}`);
      if (response.data.success) {
        setForecastData(response.data.data);
      } else {
        setError('Failed to load forecast data');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while forecasting. Ensure Gemini API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="mr-3 text-blue-600" size={32} />
          AI Demand Forecasting & Auto-Reorder
        </h1>
        <p className="text-gray-600 mt-2">
          Powered by Gemini AI. Analyzes past 30 days of sales to predict future demand and suggest optimal reorder quantities.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">AI is analyzing sales data and predicting demand...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : forecastData.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Data Available</h3>
          <p className="text-gray-500 mt-2">Make some sales first for the AI to analyze patterns.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last 30D Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">AI Forecast (Next 30D)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Suggested Reorder</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Reasoning</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forecastData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 capitalize">{item.medicineName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.currentStock < item.forecastedNext30DaysDemand ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {item.currentStock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.past30DaysSales} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-700 bg-purple-50/30">
                      {item.forecastedNext30DaysDemand} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.suggestedReorderQuantity > 0 ? (
                        <div className="flex items-center text-sm font-bold text-blue-600">
                          <Package className="w-4 h-4 mr-1" />
                          Order +{item.suggestedReorderQuantity}
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Stock Sufficient
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate" title={item.reason}>
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandForecasting;
