import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SupportTicketForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    issueType: 'Bug/Error',
    subject: '',
    description: '',
    stepsToReproduce: '',
    priority: 'Medium',
    email: localStorage.getItem('email') || ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Parse query params to pre-fill subject or issue type
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('source');
    
    if (source) {
      setFormData(prev => ({
        ...prev,
        subject: `Issue in ${source} Module`,
        description: `I encountered an issue while using the ${source} feature. `
      }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulating a backend call to submit the support ticket
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Your error report has been submitted successfully! Our technical team will resolve it soon.');
      
      // Reset form
      setFormData({
        issueType: 'Bug/Error',
        subject: '',
        description: '',
        stepsToReproduce: '',
        priority: 'Medium',
        email: localStorage.getItem('email') || ''
      });
      
      // Optionally navigate back or to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Report an Issue / Support Ticket</h2>
          <p className="text-indigo-100">
            Encountered an error or need help? Submit a ticket and our technical team will assist you immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                readOnly={!!localStorage.getItem('email')}
                className={`w-full px-4 py-3 rounded-lg border ${localStorage.getItem('email') ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500'}`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Bug/Error">Bug / System Error</option>
                <option value="Feature Request">Feature Request</option>
                <option value="General Support">General Support</option>
                <option value="Billing/Invoice">Billing / Invoice Issue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="E.g., Cannot load expiry bill, Error 500 on submit"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Please describe the issue in detail..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {formData.issueType === 'Bug/Error' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Steps to Reproduce (Optional)</label>
              <textarea
                name="stepsToReproduce"
                value={formData.stepsToReproduce}
                onChange={handleChange}
                rows="3"
                placeholder="1. Go to Expiry Bill&#10;2. Click on Client Expiry Return&#10;3. See error..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
            <div className="flex gap-4">
              {['Low', 'Medium', 'High', 'Critical'].map(level => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={level}
                    checked={formData.priority === level}
                    onChange={handleChange}
                    className="form-radio text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={`${
                    level === 'Critical' ? 'text-red-600 font-semibold' :
                    level === 'High' ? 'text-orange-500' :
                    level === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 mr-4 text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg disabled:bg-indigo-400 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportTicketForm;
