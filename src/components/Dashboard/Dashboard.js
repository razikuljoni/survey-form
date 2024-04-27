/* eslint-disable arrow-body-style */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-inner-declarations */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable prettier/prettier */

import { Image, Table } from "antd";
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import CountUp from 'react-countup';
import { CSVLink } from 'react-csv';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import DatePicker from 'react-multi-date-picker';
import InputIcon from 'react-multi-date-picker/components/input_icon';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assets/logo.svg';
import './dashboard.css';

const notify = (status, message) => {
    status(message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
};

function Dashboard() {
    // loading state
    const [loading, setLoading] = useState(false);

    // data store
    const [data, setData] = useState([]);

    // tostify message
    const { success, error } = toast;

    // date state
    const [value, setValue] = useState(new Date());

    // current survey state
    const [formValue, setFormValue] = useState(localStorage.getItem('formValue') || 'tsrforms');

     const [expandedRow, setExpandedRow] = useState(null);

    // get survey value
    function getValue(e) {
        localStorage.setItem('formValue', e);
        setFormValue(e);
        notify(success, 'Survey Moved.');
    }

    // common data
    function commonData(dataArr, i) {
        const result = {
            Timestamp: new Date(dataArr[i].createdAt).toLocaleString(),
            Region: dataArr[i].region,
            Area: dataArr[i].area,
            Territory: dataArr[i].territory,
            Distribution_House: dataArr[i].distributionHouse,
            Point: dataArr[i].point,
            Route: dataArr[i].route,
            Section: dataArr[i].section,
            Cluster: dataArr[i].cluster,
            Outlet_Code: dataArr[i].outletCode,
            Outlet_Name: dataArr[i].outletName,
        };
        return result;
    }


    function getAiQty (str,dataArr = []) {
        return dataArr?.find((name) => name.name === str)?.qty || '';
    }

    // data normalization and rename function
    function dataNormalize(result) {
        const finalTsrFormData = result.map((doc, i) => ({
            ...commonData(result, i),
            CM_Code: doc.CMCode,
            CM_Name: doc.CMName,
            Consumer_Contact_Number: doc.consumerContactNumber,
            Consumer_Name: doc.consumerName,
            Consumer_Age: doc.consumerAge,
            Consumer_Occupation: doc.occupation,
            Smoking_Brand: doc.smokingBrand,
            Signature_Url: doc.signature,
            'Unique Capsule': getAiQty('Unique Capsule', doc?.material),
            'Refreshing Taste and Smell': getAiQty('Refreshing Taste and Smell', doc?.material),
            'Benson & Hadges Breeze': getAiQty('Benson & Hadges Breeze', doc?.material),
            Audio_Url: doc.trackUrl,
        }));


        const finalMsSurveyData = result.map((doc, i) => ({
            ...commonData(result, i),
            MS_Code: doc.MSCode,
            MS_Name: doc.MSName,
            visited_CM_Code: doc.visitedCMCode,
            Is_CM_Present: doc.isCMPresent,
            CM_Contact_Quality: doc.CMContactQuality,
            Is_CM_Delivering_Right_Brand: doc.isCMDeliveringRightBrand,
        }));

        const finalPriceComplianceSurveyData = result.map((doc, i) => ({
            ...commonData(result, i),
            CM_Code: doc.CMCode,
            CM_Name: doc.CMName,
            Compliance_Status: doc.complianceStatus,
            Purchase_Brand: doc.purchaseBrand,
            Purchase_Price: doc.purchasePrice,
        }));

        if (formValue === 'tsrforms') {
            setData(finalTsrFormData);
        }
        if (formValue === 'mslivesurveys') {
            setData(finalMsSurveyData);
        }
        if (formValue === 'pricecompliancesurveys') {
            setData(finalPriceComplianceSurveyData);
        }
    }


    const count1 = data?.reduce((a,c) =>  a + (Number(c['Unique Capsule']) >= 1 ? 1 : 0)
     , 0)

     const count2 = data?.reduce((a,c) =>  a + (Number(c['Refreshing Taste and Smell']) >= 1 ? 1 : 0)
     , 0)
     const count3 = data?.reduce((a,c) =>  a + (Number(c['Benson & Hadges Breeze']) >= 1 ? 1 : 0)
     , 0)

     const totalKeywordCountOutlet = data?.reduce((count, item) => {
        const hasUniqueCapsule = item['Unique Capsule'] >= 1;
        const hasRefreshingTasteAndSmell = item['Refreshing Taste and Smell'] >= 1;
        const hasBensonAndHadgesBreeze = item['Benson & Hadges Breeze'] >= 1;
      
        if (hasUniqueCapsule || hasRefreshingTasteAndSmell || hasBensonAndHadgesBreeze) {
          return count + 1;
        } 
          return count;
        
      }, 0);

    // date format
    // function formatDate(val) {
    //     let dateArr = [];
    //     const day = new Date(val).getDate();
    //     const month = new Date(val).getMonth() + 1;
    //     const year = new Date(val).getFullYear();
    //     dateArr = [`${day < 10 ? `0${day}` : day}-${month < 10 ? `0${month}` : month}-${year}`];
    //     return dateArr;
    // }

    // close calendar and call a function to get data
    function calendarCloseFunc() {
        const dateArr = {
            startDate: dayjs(new Date()).startOf("day").toJSON(),
            endDate: dayjs(new Date()).endOf("day").toJSON()
        };

        if (value.length === 1 || value.length === undefined) {
            dateArr.startDate = dayjs(value[0]).startOf("day").toJSON();
            dateArr.endDate = dayjs(value[0]).endOf("day").toJSON();
        }
        if (value.length === 2) {
            dateArr.startDate = dayjs(value[0]).startOf("day").toJSON();
            dateArr.endDate = dayjs(value[1]).endOf("day").toJSON();
        }

        if (dateArr.startDate) {
            async function fetchData() {
                setLoading(true);
                try {
                    const res = await fetch(
                        `https://form.hedigital.online/v1/form/getallform`,
                        {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json',
                            },
                            body: JSON.stringify({
                                ...dateArr,
                            }),
                        }
                    );
                    const result = await res.json();
                    dataNormalize(result?.data);
                    setLoading(false);
                } catch (e) {
                    notify(error, `${e}`);
                    setLoading(false);
                }
            }
            fetchData();
        }
    }

    // initial fetch data
    useEffect(() => {
        calendarCloseFunc();
    }, [formValue]);

        const handleExpand = (key) => {
        if (expandedRow === key) {
            setExpandedRow(null);
        } else {
            setExpandedRow(key);
        }
    };

     const columns = [
        {
            title: "Signature",
            dataIndex: "Signature_Url",
            render: (signature) => 
              <Image
                                                                width={50}
                                                                height={50}
                                                               style={{
                                                                border: "1px solid grey",
                                                                borderRadius: "10px"
                                                               }}
                                                                preview={{
                                                                    src:
                                                                        signature ||
                                                                        "",
                                                                }}
                                                                src={
                                                                    signature ||
                                                                    ""
                                                                }
                                                            />,
        },
        {
            title: "Timestamp",
            dataIndex: "Timestamp",
            render: (Timestamp) => ( <span className="extended__row__label">{Timestamp}</span>),
        },
        {
            title: "Contact Number",
            dataIndex: "Consumer_Contact_Number",
            render: (num) => ( <span className="extended__row__label">{num}</span>),
        },
      
        {
    title: 'Audio',
    dataIndex: 'trackUrl',
    render: (trackUrl) => {
        return trackUrl ? (
      <audio controls>
        <source src={trackUrl} />
        Your browser does not support the audio element.
      </audio>
    ) : null;
    },
  },
   
    ];

    console.log("data", data)

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="">
                        {loading ? (
                            <>
                                <Skeleton
                                    count={1}
                                    width={80}
                                    height={40}
                                    inline
                                    style={{ marginRight: '0.8rem' }}
                                />
                                <Skeleton
                                    count={2}
                                    width={180}
                                    height={40}
                                    inline
                                    style={{ marginRight: '0.5rem' }}
                                />
                            </>
                        ) : (
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <img src={logo} alt="form logo" className="logo" />
                                <select
                                    name="form-data"
                                    className="form-drop-down"
                                    defaultValue={formValue}
                                    onChange={(e) => getValue(e.target.value)}
                                >
                                    <option value="tsrforms">TSR Form</option>
                                    {/* <option value="pricecompliancesurveys">
                                        Price Complaiance Survey
                                    </option>
                                    <option value="mslivesurveys">MS Live Survey</option> */}
                                </select>
                                <DatePicker
                                    disabled={loading}
                                    value={value}
                                    onChange={(e) => setValue(e)}
                                    className="date-cal"
                                    range
                                    render={<InputIcon />}
                                    onClose={() => calendarCloseFunc()}
                                />
                                <h2 className="title" style={{margin: '0 0 0 30px'}}>
                                {loading ? 'Loading....' : 'Survey Dashboard'}
                                </h2>
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <Spinner animation="border" variant="primary" />
                    ) : (
                        <CSVLink
                            data={data}
                            className="btn btn-primary"
                            filename={`${formValue}_report_${new Date().toLocaleString()}.csv`}
                            onClick={() => notify(success, 'Download Complete')}
                        >
                            Download Report
                        </CSVLink>
                    )}
                </div>

                <section className="title-container">
                    <Container>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            
                            <div>
                            {!loading && <h2 className="title2">
                                Total Submitted: <CountUp end={data?.length || 0} />
                            </h2>}
                            {!loading && <h2 className="title2">
                                Keyword Detect Outlet: <CountUp end={totalKeywordCountOutlet || 0} />
                            </h2>}
                            </div>

                            <div>
                                {!loading && 
                                    <p style={{margin: 0}}>
                                        <span style={{fontWeight: 600}}>Unique Capsule: </span> ({count1}/{data?.length}) <span style={{fontWeight: 600}}>{Math.round((100 * count1) /( data?.length || 0))}%</span>
                                    </p>
                                }
                                {!loading && 
                                    <p style={{margin: 0}}>
                                        <span style={{fontWeight: 600}}>Refreshing Taste and Smell: </span>({count2}/{data?.length}) <span style={{fontWeight: 600}}>{Math.round((100 * count2) /( data?.length || 0))}%</span>
                                    </p>
                                }
                                {!loading && 
                                    <p style={{margin: 0}}>
                                        <span style={{fontWeight: 600}}>Benson & Hadges Breeze: </span>({count3}/{data?.length}) <span style={{fontWeight: 600}}>{Math.round((100 * count3) /( data?.length || 0))}%</span>
                                    </p>
                                }
                            </div>
                        </div>
                    </Container>
                </section>

                {/* <section className="survey-cart-container">
                    <Container>
                        <Row md={3} lg={3} sm={2} xs={1}>
                            <Col className="mb-5">
                                <div className="cart cart-1">
                                    <div className="cart-top-area">
                                        <h4>Chittagong</h4>
                                        {loading ? (
                                            <Spinner animation="border" variant="primary" />
                                        ) : (
                                            <CSVLink
                                                data={data?.filter(
                                                    (v) => v.Region === 'Chittagong'
                                                )}
                                                filename={`${formValue}_chittagong_report_${new Date().toLocaleString()}.csv`}
                                                onClick={() => notify(success, 'Download Complete')}
                                            >
                                                <img
                                                    src={downloadIcon}
                                                    alt="Download Chittagong Data"
                                                    title="Download Chittagong Data"
                                                />
                                            </CSVLink>
                                        )}
                                    </div>
                                    <p>
                                        {loading ? (
                                            0
                                        ) : (
                                            <CountUp
                                                end={
                                                    data?.filter(
                                                        (doc) => doc.Region === 'Chittagong'
                                                    ).length || 0
                                                }
                                            />
                                        )}
                                    </p>
                                </div>
                            </Col>

                            <Col className="mb-5">
                                <div className="cart cart-2">
                                    <div className="cart-top-area">
                                        <h4>Dhaka</h4>
                                        {loading ? (
                                            <Spinner animation="border" variant="primary" />
                                        ) : (
                                            <CSVLink
                                                data={data?.filter((v) => v.Region === 'Dhaka North' || v.Region === 'Dhaka South')}
                                                filename={`${formValue}_dhaka_report_${new Date().toLocaleString()}.csv`}
                                                onClick={() => notify(success, 'Download Complete')}
                                            >
                                                <img
                                                    src={downloadIcon}
                                                    alt="Download Dhaka Data"
                                                    title="Download Dhaka Data"
                                                />
                                            </CSVLink>
                                        )}
                                    </div>
                                    <p>
                                        {loading ? (
                                            0
                                        ) : (
                                            <CountUp
                                                end={
                                                    data?.filter((doc) => doc.Region === 'Dhaka North' || doc.Region === 'Dhaka South')
                                                        .length || 0
                                                }
                                            />
                                        )}
                                    </p>
                                </div>
                            </Col>

                            <Col className="mb-5">
                                <div className="cart cart-3">
                                    <div className="cart-top-area">
                                        <h4>Khulna</h4>
                                        {loading ? (
                                            <Spinner animation="border" variant="primary" />
                                        ) : (
                                            <CSVLink
                                                data={data?.filter((v) => v.Region === 'Khulna')}
                                                filename={`${formValue}_Khulna_report_${new Date().toLocaleString()}.csv`}
                                                onClick={() => notify(success, 'Download Complete')}
                                            >
                                                <img
                                                    src={downloadIcon}
                                                    alt="Download Khulna Data"
                                                    title="Download Khulna Data"
                                                />
                                            </CSVLink>
                                        )}
                                    </div>
                                    <p>
                                        {loading ? (
                                            0
                                        ) : (
                                            <CountUp
                                                end={
                                                    data?.filter((doc) => doc.Region === 'Khulna')
                                                        .length || 0
                                                }
                                            />
                                        )}
                                    </p>
                                </div>
                            </Col>

                            <Col className="mb-5">
                                <div className="cart cart-4">
                                    <div className="cart-top-area">
                                        <h4>Rajshahi</h4>
                                        {loading ? (
                                            <Spinner animation="border" variant="primary" />
                                        ) : (
                                            <CSVLink
                                                data={data?.filter((v) => v.Region === 'Rajshahi')}
                                                filename={`${formValue}_rajshahi_report_${new Date().toLocaleString()}.csv`}
                                                onClick={() => notify(success, 'Download Complete')}
                                            >
                                                <img
                                                    src={downloadIcon}
                                                    alt="Download Rajshahi Data"
                                                    title="Download Rajshahi Data"
                                                />
                                            </CSVLink>
                                        )}
                                    </div>
                                    <p>
                                        {loading ? (
                                            0
                                        ) : (
                                            <CountUp
                                                end={
                                                    data?.filter((doc) => doc.Region === 'Rajshahi')
                                                        .length || 0
                                                }
                                            />
                                        )}
                                    </p>
                                </div>
                            </Col>

                            <Col className="mb-5">
                                <div className="cart cart-5">
                                    <div className="cart-top-area">
                                        <h4>Sylhet</h4>
                                        {loading ? (
                                            <Spinner animation="border" variant="primary" />
                                        ) : (
                                            <CSVLink
                                                data={data?.filter((v) => v.Region === 'Sylhet')}
                                                filename={`${formValue}_sylhet_report_${new Date().toLocaleString()}.csv`}
                                                onClick={() => notify(success, 'Download Complete')}
                                            >
                                                <img
                                                    src={downloadIcon}
                                                    alt="Download Sylhet Data"
                                                    title="Download Sylhet Data"
                                                />
                                            </CSVLink>
                                        )}
                                    </div>
                                    <p>
                                        {loading ? (
                                            0
                                        ) : (
                                            <CountUp
                                                end={
                                                    data?.filter((doc) => doc.Region === 'Sylhet')
                                                        .length || 0
                                                }
                                            />
                                        )}
                                    </p>
                                </div>
                            </Col>

                            <Col className="mb-5">
                                <div className="cart cart-6">
                                    <div className="cart-top-area">
                                        <h4>Barishal</h4>
                                        {loading ? (
                                            <Spinner animation="border" variant="primary" />
                                        ) : (
                                            <CSVLink
                                                data={data?.filter((v) => v.Region === 'Barishal')}
                                                filename={`${formValue}_barishal_report_${new Date().toLocaleString()}.csv`}
                                                onClick={() => notify(success, 'Download Complete')}
                                            >
                                                <img
                                                    src={downloadIcon}
                                                    alt="Download Barishal Data"
                                                    title="Download Barishal Data"
                                                />
                                            </CSVLink>
                                        )}
                                    </div>
                                    <p>
                                        {loading ? (
                                            0
                                        ) : (
                                            <CountUp
                                                end={
                                                    data?.filter((doc) => doc.Region === 'Barishal')
                                                        .length || 0
                                                }
                                            />
                                        )}
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section> */}

                <Table
                style={{
                    marginTop: '20px',
                    marginBottom: '20px',
                }}
                 columns={columns}
                                dataSource={data}
                               pagination={false}
                               expandable={{
      expandedRowRender: (record) => (
        <ul>
            {record?.material?.map((item, index) => (
                <li key={index}>
                    <div className="cart cart-6">
                        <div className="cart-top-area">
                            <h4>{item?.name}</h4>
                            <p>{item?.qty}</p>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
      ),
      rowExpandable: (record) => record?.material?.length > 0,

        //   rowExpandable: (record) =>
        //                                 !!record.description,
                                    expandedRowKeys: [expandedRow],
                                    onExpand: (expanded, record) => {
                                        if (expanded) {
                                            handleExpand(record.key);
                                        } else {
                                            handleExpand(null);
                                        }
                                    },
    }}
                            />



                <section className="footer">
                    <footer>
                        <Container>
                            <p className="copyright">
                                &copy; {new Date().getFullYear()}{' '}
                                <a href="https://hedigital.tech/" target="_blank" rel="noreferrer">
                                    {' '}
                                    HawkEyes Digital Monitoring Ltd.
                                </a>{' '}
                                All Rights Reserved.
                            </p>
                        </Container>
                    </footer>
                </section>
            </div>
        </>
    );
}

export default Dashboard;
