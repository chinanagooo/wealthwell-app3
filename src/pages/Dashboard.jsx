import React from 'react';

const Dashboard = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '1200px',
      padding: '2rem',
      gap: '2rem'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        gap: '2rem',
        alignItems: 'flex-start'
      }}>
        {/* Blue Sidebar */}
        <div style={{
          width: '250px',
          background: '#2563eb',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          height: 'fit-content'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Portfolio</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></span>
            <span>Assets</span>
          </div>
          <div style={{ marginBottom: '1rem' }}>Loadings</div>
          <div>Transactions</div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ color: '#10b981', fontWeight: 'bold' }}>$50,000</div>
              <div>Portfolio</div>
            </div>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ color: '#ef4444', fontWeight: 'bold' }}>-$500</div>
              <div>Daily Change</div>
            </div>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>$80,000</div>
              <div>Total Assets</div>
            </div>
          </div>

          {/* Asset Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Stocks</span>
                <span style={{ color: '#10b981' }}>$25,000</span>
              </div>
              <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: '#10b981' }}></div>
              </div>
            </div>
            {/* Add more asset cards as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
