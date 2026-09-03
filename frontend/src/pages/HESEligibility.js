import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';

export default function HESEligibility() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [answers, setAnswers] = useState({
    // Basic Eligibility
    scotland: '',
    homeowner: '',
    main_residence: '',
    
    // Property Details
    property_type: '',
    built_before_1994: '',
    
    // Existing Heating System
    current_heating: '',
    boiler_age: '',
    
    // Heat Pump Eligibility
    suitable_for_heat_pump: '',
    adequate_insulation: '',
    water_heating_needed: '',
    
    // Technical Requirements
    space_for_outdoor_unit: '',
    access_for_installation: '',
    
    // Funding/Income
    household_income_eligible: '',
    
    // Notes
    notes: ''
  });

  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLead(response.data.lead);
      
      // Fetch existing HES eligibility if available
      fetchHESData();
      setLoading(false);
    } catch (err) {
      setError('Failed to load lead');
      setLoading(false);
    }
  };

  const fetchHESData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/leads/${leadId}/hes-eligibility`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setAnswers(response.data.answers || answers);
      }
    } catch (err) {
      // No existing data, that's fine
    }
  };

  const handleAnswer = (field, value) => {
    setAnswers({ ...answers, [field]: value });
  };

  const calculateEligibility = () => {
    const result = {
      air_source_heat_pump: 'ELIGIBLE',
      reasons: [],
      needs_verification: []
    };

    // Basic Eligibility checks
    if (answers.scotland === 'no') {
      result.air_source_heat_pump = 'NOT_ELIGIBLE';
      result.reasons.push('Property is not located in Scotland');
      return result;
    }

    if (answers.scotland === 'not_sure') {
      result.needs_verification.push('Property location needs verification');
    }

    if (answers.homeowner === 'no') {
      result.air_source_heat_pump = 'NOT_ELIGIBLE';
      result.reasons.push('Applicant is not the homeowner');
      return result;
    }

    if (answers.homeowner === 'not_sure') {
      result.needs_verification.push('Homeowner status needs verification');
    }

    if (answers.main_residence === 'no') {
      result.air_source_heat_pump = 'NOT_ELIGIBLE';
      result.reasons.push('Property is not the main residence');
      return result;
    }

    if (answers.main_residence === 'not_sure') {
      result.needs_verification.push('Main residence status needs verification');
    }

    // Property checks
    if (answers.built_before_1994 === 'not_sure') {
      result.needs_verification.push('Property build date needs verification');
    }

    // Heat Pump specific
    if (answers.suitable_for_heat_pump === 'no') {
      result.air_source_heat_pump = 'NOT_ELIGIBLE';
      result.reasons.push('Property is not technically suitable for air source heat pump');
      return result;
    }

    if (answers.suitable_for_heat_pump === 'not_sure') {
      result.needs_verification.push('Technical suitability for heat pump needs survey/verification');
    }

    if (answers.space_for_outdoor_unit === 'no') {
      result.air_source_heat_pump = 'NOT_ELIGIBLE';
      result.reasons.push('No suitable space for outdoor heat pump unit');
      return result;
    }

    if (answers.space_for_outdoor_unit === 'not_sure') {
      result.needs_verification.push('Space for outdoor unit needs verification on site visit');
    }

    // Determine final status
    if (result.reasons.length > 0) {
      result.air_source_heat_pump = 'NOT_ELIGIBLE';
    } else if (result.needs_verification.length > 0) {
      result.air_source_heat_pump = 'NEEDS_VERIFICATION';
    } else if (
      answers.scotland === 'yes' &&
      answers.homeowner === 'yes' &&
      answers.main_residence === 'yes' &&
      answers.suitable_for_heat_pump === 'yes' &&
      answers.space_for_outdoor_unit === 'yes'
    ) {
      result.air_source_heat_pump = 'ELIGIBLE';
    } else {
      result.air_source_heat_pump = 'NEEDS_VERIFICATION';
    }

    return result;
  };

  const handleSave = async () => {
    setSaving(true);
    const eligibilityResult = calculateEligibility();
    setEligibility(eligibilityResult);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/leads/${leadId}/hes-eligibility`, 
        { answers, eligibility: eligibilityResult },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('HES Eligibility assessment saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save HES Eligibility assessment');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'ELIGIBLE') return '#4caf50';
    if (status === 'NOT_ELIGIBLE') return '#f44336';
    if (status === 'NEEDS_VERIFICATION') return '#ff9800';
    return '#999';
  };

  const getStatusText = (status) => {
    if (status === 'ELIGIBLE') return '✓ ELIGIBLE';
    if (status === 'NOT_ELIGIBLE') return '✗ NOT ELIGIBLE';
    if (status === 'NEEDS_VERIFICATION') return '⚠ NEEDS VERIFICATION';
    return 'UNKNOWN';
  };

  if (loading) return <div className="container"><div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div></div>;
  if (!lead) return <div className="container"><div className="error-message">Lead not found</div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <button 
            onClick={() => navigate(`/lead/${leadId}`)}
            style={{ marginBottom: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#082E58', fontWeight: 'bold', fontSize: '14px' }}
          >
            ← Back to Lead
          </button>
          <h1>HES Eligibility Assessment</h1>
          <p>{lead.name} • {lead.postcode}</p>
        </div>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}
      {success && <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '6px', color: '#2e7d32' }}>✓ {success}</div>}

      <div className="form-card" style={{ marginBottom: '24px' }}>
        
        {/* BASIC ELIGIBILITY */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#082E58', marginTop: 0 }}>Basic Eligibility</h3>
          
          <div className="form-group">
            <label>Is the property located in Scotland? *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['yes', 'no', 'not_sure'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer('scotland', opt)}
                  style={{
                    padding: '8px 16px',
                    background: answers.scotland === opt ? '#082E58' : '#f0f0f0',
                    color: answers.scotland === opt ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {opt === 'not_sure' ? 'Not Sure' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Are you the homeowner of this property? *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['yes', 'no', 'not_sure'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer('homeowner', opt)}
                  style={{
                    padding: '8px 16px',
                    background: answers.homeowner === opt ? '#082E58' : '#f0f0f0',
                    color: answers.homeowner === opt ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {opt === 'not_sure' ? 'Not Sure' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Is this your main residence? *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['yes', 'no', 'not_sure'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer('main_residence', opt)}
                  style={{
                    padding: '8px 16px',
                    background: answers.main_residence === opt ? '#082E58' : '#f0f0f0',
                    color: answers.main_residence === opt ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {opt === 'not_sure' ? 'Not Sure' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PROPERTY DETAILS */}
        <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
          <h3 style={{ color: '#082E58', marginTop: 0 }}>Property Details</h3>
          
          <div className="form-group">
            <label>What type of property is this?</label>
            <select 
              value={answers.property_type} 
              onChange={(e) => handleAnswer('property_type', e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}
            >
              <option value="">Select...</option>
              <option value="detached">Detached house</option>
              <option value="semi_detached">Semi-detached house</option>
              <option value="terraced">Terraced house</option>
              <option value="flat">Flat/Apartment</option>
              <option value="bungalow">Bungalow</option>
              <option value="other">Other</option>
              <option value="not_sure">Not Sure</option>
            </select>
          </div>

          <div className="form-group">
            <label>Was the property built before 1994? *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['yes', 'no', 'not_sure'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer('built_before_1994', opt)}
                  style={{
                    padding: '8px 16px',
                    background: answers.built_before_1994 === opt ? '#082E58' : '#f0f0f0',
                    color: answers.built_before_1994 === opt ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {opt === 'not_sure' ? 'Not Sure' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EXISTING HEATING SYSTEM */}
        <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
          <h3 style={{ color: '#082E58', marginTop: 0 }}>Existing Heating System</h3>
          
          <div className="form-group">
            <label>What is the main heating system currently in the property?</label>
            <select 
              value={answers.current_heating} 
              onChange={(e) => handleAnswer('current_heating', e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}
            >
              <option value="">Select...</option>
              <option value="gas_boiler">Gas boiler</option>
              <option value="oil_boiler">Oil boiler</option>
              <option value="electric_heating">Electric heating</option>
              <option value="heat_pump">Heat pump (existing)</option>
              <option value="solid_fuel">Solid fuel (wood, coal)</option>
              <option value="other">Other</option>
              <option value="not_sure">Not Sure</option>
            </select>
          </div>

          <div className="form-group">
            <label>Approximate age of current heating system</label>
            <select 
              value={answers.boiler_age} 
              onChange={(e) => handleAnswer('boiler_age', e.target.value)}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}
            >
              <option value="">Select...</option>
              <option value="less_5">Less than 5 years</option>
              <option value="5_10">5-10 years</option>
              <option value="10_15">10-15 years</option>
              <option value="more_15">More than 15 years</option>
              <option value="not_sure">Not Sure</option>
            </select>
          </div>
        </div>

        {/* HEAT PUMP ELIGIBILITY */}
        <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
          <h3 style={{ color: '#082E58', marginTop: 0 }}>Air Source Heat Pump Eligibility</h3>
          
          <div className="form-group">
            <label>Is the property suitable for an air source heat pump installation? *</label>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', marginBottom: '12px' }}>
              This includes adequate space, suitable building structure, and no major access issues
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['yes', 'no', 'not_sure'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer('suitable_for_heat_pump', opt)}
                  style={{
                    padding: '8px 16px',
                    background: answers.suitable_for_heat_pump === opt ? '#082E58' : '#f0f0f0',
                    color: answers.suitable_for_heat_pump === opt ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {opt === 'not_sure' ? 'Not Sure' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Does the property have adequate insulation for a heat pump to work efficiently? *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['yes', 'no', 'not_sure'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer('adequate_insulation', opt)}
                  style={{
                    padding: '8px 16px',
                    background: answers.adequate_insulation === opt ? '#082E58' : '#f0f0f0',
                    color: answers.adequate_insulation === opt ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {opt === 'not_sure' ? 'Not Sure' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Is there sufficient space for the outdoor heat pump unit? *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['yes', 'no', 'not_sure'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer('space_for_outdoor_unit', opt)}
                  style={{
                    padding: '8px 16px',
                    background: answers.space_for_outdoor_unit === opt ? '#082E58' : '#f0f0f0',
                    color: answers.space_for_outdoor_unit === opt ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {opt === 'not_sure' ? 'Not Sure' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ADDITIONAL NOTES */}
        <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
          <h3 style={{ color: '#082E58', marginTop: 0 }}>Additional Notes</h3>
          <textarea
            value={answers.notes}
            onChange={(e) => handleAnswer('notes', e.target.value)}
            placeholder="Any additional notes or observations from the customer call"
            rows="4"
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'Arial' }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px',
            background: '#082E58',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          {saving ? 'Saving...' : 'Save HES Eligibility Assessment'}
        </button>
      </div>

      {/* ELIGIBILITY RESULT */}
      {eligibility && (
        <div className="card" style={{ marginTop: '24px', background: '#f5f5f5', borderLeft: '4px solid #082E58' }}>
          <h2 style={{ color: '#082E58', marginTop: 0 }}>HES ELIGIBILITY RESULT</h2>

          <div style={{
            padding: '16px',
            background: 'white',
            borderRadius: '6px',
            marginBottom: '16px',
            borderLeft: `4px solid ${getStatusColor(eligibility.air_source_heat_pump)}`
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Air Source Heat Pump</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: getStatusColor(eligibility.air_source_heat_pump)
            }}>
              {getStatusText(eligibility.air_source_heat_pump)}
            </div>
          </div>

          {eligibility.reasons.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ color: '#f44336', margin: '0 0 8px 0' }}>Ineligibility Reasons:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                {eligibility.reasons.map((reason, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {eligibility.needs_verification.length > 0 && (
            <div>
              <h4 style={{ color: '#ff9800', margin: '0 0 8px 0' }}>Requires Further Verification:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                {eligibility.needs_verification.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
