import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';

import {
  getActivityReport,
  getDailyMetricsReport,
  getRoomUsage,
  getTodayMetrics
} from '../services/api';

import { useLanguage } from '../contexts/LanguageContext';


function Reports() {

  const navigate = useNavigate();

  const { translations: t, language } = useLanguage();

  const [dailyReports, setDailyReports] = useState([]);

  const [todayMetrics, setTodayMetrics] = useState(null);

  const [roomUsage, setRoomUsage] = useState([]);

  const [activityReport, setActivityReport] = useState({
    logs: [],
    summary: []
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');


  const locale = language === 'en' ? 'en-US' : 'es-AR';


  const tx = (esText, enText) => {
    return language === 'en' ? enText : esText;
  };


  const paymentLabels = {
    cash: t.reports.cash,
    card: t.reports.card,
    transfer: t.reports.transfer
  };


  useEffect(() => {

    const loadReports = async () => {

      try {

        setLoading(true);

        setError('');


        const [
          reportData,
          metricsData,
          roomData,
          activityData
        ] = await Promise.all([

          getDailyMetricsReport(),

          getTodayMetrics(),

          getRoomUsage(),

          getActivityReport()

        ]);


        setDailyReports(
          Array.isArray(reportData)
            ? reportData
            : []
        );

        setTodayMetrics(
          metricsData || {}
        );

        setRoomUsage(
          Array.isArray(roomData)
            ? roomData
            : []
        );

        setActivityReport(
          activityData || {
            logs: [],
            summary: []
          }
        );


      } catch (err) {

        console.error('Error loading reports:', err);

        setError(t.reports.loadError);

      } finally {

        setLoading(false);

      }

    };


    loadReports();

  }, []);


  const formatCurrency = (value) => {

    const number = Number(value || 0);

    return `$${number.toLocaleString(locale)}`;

  };


  const formatDuration = (seconds) => {

    const totalSeconds = Number(seconds || 0);

    if (!totalSeconds) {
      return '0 min';
    }

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    return hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;

  };


  const formatDateTime = (value) => {

    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleString(
      locale,
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    );

  };


  const latestDailyReport = useMemo(
    () => dailyReports[0] || {},
    [dailyReports]
  );


  const paymentBreakdown = useMemo(() => {

    const income =
      todayMetrics?.daily ||
      latestDailyReport;


    return {

      cash: Number(
        income.cash_income || 0
      ),

      card: Number(
        income.card_income || 0
      ),

      transfer: Number(
        income.transfer_income || 0
      )

    };

  }, [
    latestDailyReport,
    todayMetrics
  ]);


  const preferredPayment = useMemo(() => {

    const entries =
      Object.entries(paymentBreakdown);


    if (entries.length === 0) {

      return {
        key: 'cash',
        value: 0
      };

    }


    const [key, value] =
      entries.reduce(
        (best, current) =>
          Number(current[1]) >
          Number(best[1])
            ? current
            : best
      );


    return {
      key,
      value: Number(value || 0)
    };

  }, [paymentBreakdown]);


  const mostUsedRoom = useMemo(() => {

    if (!roomUsage.length) {
      return null;
    }


    return roomUsage.reduce(
      (best, room) =>
        Number(room.total_shifts || 0) >
        Number(best.total_shifts || 0)
          ? room
          : best,
      roomUsage[0]
    );

  }, [roomUsage]);


  const sessionSummary = useMemo(() => {

    const summary =
      Array.isArray(activityReport.summary)
        ? activityReport.summary
        : [];


    return summary.map((item) => ({

      ...item,

      total_logins:
        Number(item.total_logins || 0),

      total_logouts:
        Number(item.total_logouts || 0),

      avg_session_seconds:
        Number(item.avg_session_seconds || 0)

    }));

  }, [activityReport]);


  const totalSessions =
    sessionSummary.reduce(
      (sum, item) =>
        sum +
        item.total_logins +
        item.total_logouts,
      0
    );


  const averageSession =
    sessionSummary.length
      ? sessionSummary.reduce(
          (sum, item) =>
            sum +
            item.avg_session_seconds,
          0
        ) / sessionSummary.length
      : 0;


  return (

    <div className="intimax-dashboard">

      <Navbar
        currentPage="reports"
        setCurrentPage={() => {}}
      />


      <main
        className="dashboard-main"
        style={{
          padding: '40px 24px'
        }}
      >

        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            background: '#111112',
            border:
              '1px solid rgba(232, 186, 111, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            color: '#f9fafb'
          }}
        >


          {/* ==================================================
              ENCABEZADO
              ================================================== */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}
          >

            <div>

              <h2
                style={{
                  marginBottom: '8px',
                  fontSize: '28px',
                  color: '#E8BA6F'
                }}
              >
                {t.reports.title}
              </h2>


              <p
                style={{
                  lineHeight: 1.7,
                  color: '#d1d5db',
                  margin: 0
                }}
              >
                {t.reports.description}
              </p>

            </div>


            <button
              onClick={() => navigate('/')}
              style={{
                background: '#E8BA6F',
                color: '#000000',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 18px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {t.reports.backToDashboard}
            </button>

          </div>


          {/* ==================================================
              ESTADO DE CARGA
              ================================================== */}

          {loading ? (

            <p
              style={{
                color: '#C8A46A'
              }}
            >
              {t.reports.loading}
            </p>

          ) : error ? (

            <p
              style={{
                color: '#ff6b6b'
              }}
            >
              {error}
            </p>

          ) : (

            <>


              {/* ==================================================
                  TARJETAS SUPERIORES
                  ================================================== */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}
              >


                {/* INGRESO TOTAL */}

                <div style={cardStyle}>

                  <span style={labelStyle}>
                    {t.reports.totalIncomeToday}
                  </span>

                  <div style={valueBoxStyle}>

                    {formatCurrency(
                      todayMetrics?.daily
                        ?.total_income ??
                      latestDailyReport
                        .total_income ??
                      0
                    )}

                  </div>

                </div>


                {/* MÉTODO DE PAGO */}

                <div style={cardStyle}>

                  <span style={labelStyle}>
                    {t.reports.mostUsedPayment}
                  </span>

                  <div style={valueBoxStyle}>

                    {preferredPayment.value > 0

                      ? `${paymentLabels[
                          preferredPayment.key
                        ] ||
                          preferredPayment.key} · ${formatCurrency(
                          preferredPayment.value
                        )}`

                      : t.reports.noPayments}

                  </div>

                </div>


                {/* HABITACIÓN MÁS USADA */}

                <div style={cardStyle}>

                  <span style={labelStyle}>
                    {t.reports.mostUsedRoom}
                  </span>

                  <div style={valueBoxStyle}>

                    {mostUsedRoom

                      ? `${tx(
                          'Hab.',
                          'Room'
                        )} ${
                          mostUsedRoom.room_number
                        } · ${
                          mostUsedRoom.total_shifts ||
                          0
                        } ${t.reports.shifts}`

                      : t.reports.noData}

                  </div>

                </div>


                {/* CONTROL DE SESIONES */}

                <div style={cardStyle}>

                  <span style={labelStyle}>
                    {t.reports.sessionControl}
                  </span>

                  <div style={valueBoxStyle}>
                    {totalSessions}{' '}
                    {t.reports.records}
                  </div>

                </div>

              </div>


              {/* ==================================================
                  INGRESOS + CAJA
                  ================================================== */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1.2fr 1fr',
                  gap: '20px',
                  marginBottom: '28px'
                }}
              >


                {/* DETALLE DE INGRESOS */}

                <div style={panelStyle}>

                  <h3 style={sectionTitleStyle}>
                    {t.reports.incomeDetail}
                  </h3>


                  <div
                    style={{
                      overflowX: 'auto'
                    }}
                  >

                    <table style={tableStyle}>

                      <thead>

                        <tr>

                          <th style={thStyle}>
                            {t.reports.date}
                          </th>

                          <th style={thStyle}>
                            {t.reports.shiftsTitle}
                          </th>

                          <th style={thStyle}>
                            {t.reports.income}
                          </th>

                          <th style={thStyle}>
                            {t.reports.cash}
                          </th>

                          <th style={thStyle}>
                            {t.reports.card}
                          </th>

                          <th style={thStyle}>
                            {t.reports.transfer}
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {dailyReports.length === 0 ? (

                          <tr>

                            <td
                              colSpan="6"
                              style={emptyStyle}
                            >
                              {t.reports.noIncomeRecords}
                            </td>

                          </tr>

                        ) : (

                          dailyReports.map(
                            (report, index) => (

                              <tr
                                key={
                                  report.date ||
                                  index
                                }
                                style={rowStyle}
                              >

                                <td style={tdStyle}>
                                  {report.date || '—'}
                                </td>

                                <td style={tdStyle}>
                                  {report.total_shifts ||
                                    0}
                                </td>

                                <td
                                  style={{
                                    ...tdStyle,
                                    color: '#00ff88',
                                    fontWeight: '700'
                                  }}
                                >
                                  {formatCurrency(
                                    report.total_income
                                  )}
                                </td>

                                <td style={tdStyle}>
                                  {formatCurrency(
                                    report.cash_income
                                  )}
                                </td>

                                <td style={tdStyle}>
                                  {formatCurrency(
                                    report.card_income
                                  )}
                                </td>

                                <td style={tdStyle}>
                                  {formatCurrency(
                                    report.transfer_income
                                  )}
                                </td>

                              </tr>

                            )
                          )

                        )}

                      </tbody>

                    </table>

                  </div>

                </div>


                {/* HISTORIAL DE CAJA */}

                <div style={panelStyle}>

                  <h3 style={sectionTitleStyle}>
                    {t.reports.cashHistory}
                  </h3>


                  <div
                    style={{
                      display: 'grid',
                      gap: '12px'
                    }}
                  >

                    {Object.entries(
                      paymentBreakdown
                    ).map(([key, value]) => (

                      <div
                        key={key}
                        style={{
                          background:
                            'rgba(255,255,255,0.02)',
                          border:
                            '1px solid rgba(232, 186, 111, 0.14)',
                          borderRadius: '12px',
                          padding: '12px 14px'
                        }}
                      >

                        <div
                          style={{
                            display: 'flex',
                            justifyContent:
                              'space-between',
                            marginBottom: '6px'
                          }}
                        >

                          <span
                            style={{
                              color: '#d1d5db'
                            }}
                          >
                            {paymentLabels[key] ||
                              key}
                          </span>


                          <strong
                            style={{
                              color: '#E8BA6F'
                            }}
                          >
                            {formatCurrency(value)}
                          </strong>

                        </div>


                        <div
                          style={{
                            height: '8px',
                            borderRadius: '999px',
                            background:
                              'rgba(255,255,255,0.08)',
                            overflow: 'hidden'
                          }}
                        >

                          <div
                            style={{
                              height: '100%',

                              width: `${Math.max(
                                (
                                  value /
                                  Math.max(
                                    Number(
                                      todayMetrics
                                        ?.daily
                                        ?.total_income ??
                                      latestDailyReport
                                        .total_income ??
                                      1
                                    ),
                                    1
                                  )
                                ) * 100,
                                4
                              )}%`,

                              background: '#E8BA6F',

                              borderRadius:
                                '999px'
                            }}
                          />

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

              </div>


              {/* ==================================================
                  SESIONES + PERSONAL
                  ================================================== */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '20px'
                }}
              >


                {/* CONTROL DE SESIONES */}

                <div style={panelStyle}>

                  <h3 style={sectionTitleStyle}>
                    {t.reports.sessionControl}
                  </h3>


                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(3, minmax(0, 1fr))',
                      gap: '12px',
                      marginBottom: '16px'
                    }}
                  >


                    <div style={miniStatStyle}>

                      <span
                        style={{
                          color: '#9CA3AF',
                          fontSize: '12px'
                        }}
                      >
                        {t.reports.sessions}
                      </span>

                      <strong
                        style={{
                          fontSize: '20px',
                          color: '#E8BA6F'
                        }}
                      >
                        {totalSessions}
                      </strong>

                    </div>


                    <div style={miniStatStyle}>

                      <span
                        style={{
                          color: '#9CA3AF',
                          fontSize: '12px'
                        }}
                      >
                        {t.reports.average}
                      </span>

                      <strong
                        style={{
                          fontSize: '20px',
                          color: '#E8BA6F'
                        }}
                      >
                        {formatDuration(
                          averageSession
                        )}
                      </strong>

                    </div>


                    <div style={miniStatStyle}>

                      <span
                        style={{
                          color: '#9CA3AF',
                          fontSize: '12px'
                        }}
                      >
                        {t.reports.staff}
                      </span>

                      <strong
                        style={{
                          fontSize: '20px',
                          color: '#E8BA6F'
                        }}
                      >
                        {sessionSummary.length}
                      </strong>

                    </div>

                  </div>


                  <div
                    style={{
                      overflowX: 'auto'
                    }}
                  >

                    <table style={tableStyle}>

                      <thead>

                        <tr>

                          <th style={thStyle}>
                            {t.reports.user}
                          </th>

                          <th style={thStyle}>
                            {t.reports.lastLogin}
                          </th>

                          <th style={thStyle}>
                            {t.reports.lastLogout}
                          </th>

                          <th style={thStyle}>
                            {t.reports.averageConnected}
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {sessionSummary.length ===
                        0 ? (

                          <tr>

                            <td
                              colSpan="4"
                              style={emptyStyle}
                            >
                              {t.reports.noSessions}
                            </td>

                          </tr>

                        ) : (

                          sessionSummary.map(
                            (user) => (

                              <tr
                                key={
                                  user.id ||
                                  user.first_name
                                }
                                style={rowStyle}
                              >

                                <td style={tdStyle}>

                                  {user.first_name ||
                                    t.reports.user}{' '}

                                  {user.last_name ||
                                    ''}

                                </td>

                                <td style={tdStyle}>
                                  {formatDateTime(
                                    user.last_login
                                  )}
                                </td>

                                <td style={tdStyle}>
                                  {formatDateTime(
                                    user.last_logout
                                  )}
                                </td>

                                <td style={tdStyle}>
                                  {formatDuration(
                                    user.avg_session_seconds
                                  )}
                                </td>

                              </tr>

                            )
                          )

                        )}

                      </tbody>

                    </table>

                  </div>

                </div>


                {/* HISTORIAL DE PERSONAL */}

                <div style={panelStyle}>

                  <h3 style={sectionTitleStyle}>
                    {t.reports.staffHistory}
                  </h3>


                  <div
                    style={{
                      overflowX: 'auto'
                    }}
                  >

                    <table style={tableStyle}>

                      <thead>

                        <tr>

                          <th style={thStyle}>
                            {t.reports.person}
                          </th>

                          <th style={thStyle}>
                            {t.reports.action}
                          </th>

                          <th style={thStyle}>
                            {t.reports.date}
                          </th>

                          <th style={thStyle}>
                            {t.reports.duration}
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {Array.isArray(
                          activityReport.logs
                        ) &&
                        activityReport.logs.length >
                          0 ? (

                          activityReport.logs
                            .slice(0, 10)
                            .map(
                              (log, index) => (

                                <tr
                                  key={`${log.user_id}-${log.timestamp}-${index}`}
                                  style={rowStyle}
                                >

                                  <td style={tdStyle}>

                                    {log.first_name ||
                                      t.reports.staff}{' '}

                                    {log.last_name ||
                                      ''}

                                  </td>


                                  <td style={tdStyle}>

                                    {log.action ===
                                    'login'
                                      ? t.reports.login
                                      : t.reports.logout}

                                  </td>


                                  <td style={tdStyle}>

                                    {new Date(
                                      log.timestamp
                                    ).toLocaleString(
                                      locale,
                                      {
                                        dateStyle:
                                          'short',

                                        timeStyle:
                                          'short'
                                      }
                                    )}

                                  </td>


                                  <td style={tdStyle}>

                                    {formatDuration(
                                      log.session_duration
                                    )}

                                  </td>

                                </tr>

                              )
                            )

                        ) : (

                          <tr>

                            <td
                              colSpan="4"
                              style={emptyStyle}
                            >
                              {t.reports.noStaffHistory}
                            </td>

                          </tr>

                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

            </>

          )}

        </div>

      </main>

    </div>

  );

}


/* ==========================================================
   ESTILOS
   ========================================================== */

const cardStyle = {

  background:
    'rgba(255,255,255,0.02)',

  border:
    '1px solid rgba(232, 186, 111, 0.14)',

  borderRadius: '16px',

  padding: '18px 16px',

  minHeight: '120px',

  display: 'flex',

  flexDirection: 'column',

  justifyContent: 'space-between',

  gap: '12px'

};


const labelStyle = {

  fontSize: '13px',

  textTransform: 'uppercase',

  letterSpacing: '0.08em',

  color: '#9CA3AF'

};


const valueBoxStyle = {

  fontSize: '20px',

  fontWeight: '700',

  color: '#E8BA6F',

  lineHeight: 1.5

};


const panelStyle = {

  background:
    'rgba(255,255,255,0.02)',

  border:
    '1px solid rgba(232, 186, 111, 0.14)',

  borderRadius: '16px',

  padding: '20px 18px'

};


const sectionTitleStyle = {

  margin: '0 0 16px',

  color: '#E8BA6F',

  fontSize: '20px'

};


const tableStyle = {

  width: '100%',

  borderCollapse: 'collapse',

  color: '#ffffff'

};


const thStyle = {

  textAlign: 'left',

  padding: '12px 8px',

  color: '#C8A46A',

  borderBottom:
    '1px solid rgba(232, 186, 111, 0.2)',

  fontSize: '12px',

  textTransform: 'uppercase',

  letterSpacing: '0.06em'

};


const tdStyle = {

  padding: '12px 8px',

  borderBottom:
    '1px solid rgba(255,255,255,0.06)',

  fontSize: '13px',

  color: '#f3f4f6'

};


const rowStyle = {

  borderBottom:
    '1px solid rgba(255,255,255,0.06)'

};


const emptyStyle = {

  padding: '16px 8px',

  color: '#9CA3AF'

};


const miniStatStyle = {

  background:
    'rgba(255,255,255,0.02)',

  border:
    '1px solid rgba(232, 186, 111, 0.14)',

  borderRadius: '12px',

  padding: '12px 10px',

  display: 'flex',

  flexDirection: 'column',

  gap: '6px'

};


export default Reports;