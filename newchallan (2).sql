-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 27, 2026 at 01:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `newchallan`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `Admin_id` int(11) NOT NULL,
  `Code` varchar(255) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `PhoneNo` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Username` varchar(100) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `Role` varchar(100) NOT NULL,
  `Address` varchar(255) NOT NULL,
  `Added_Date` timestamp NOT NULL DEFAULT current_timestamp(),
  `Updated_Date` timestamp NOT NULL DEFAULT current_timestamp(),
  `Status` varchar(100) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`Admin_id`, `Code`, `Name`, `PhoneNo`, `Email`, `Username`, `Password`, `Role`, `Address`, `Added_Date`, `Updated_Date`, `Status`) VALUES
(1, 'ADM_1', 'Vikas Tiwaskar', '7229909221', 'vikas@gmail.com', 'Admin', 'Admin@123', 'Admin', 'Pune', '2026-07-13 09:39:11', '2026-07-14 09:24:01', 'Active'),
(4, 'ADM_3', 'Pallavi ', '9854785487', 'pallavi@gmail.com', 'Pallavi', '6372cff8497053c3', 'Accountant', 'Nagpur', '2026-07-14 06:54:06', '2026-07-14 06:54:06', 'Active'),
(6, 'ADM_4', 'Manisha Kulkarni', '9985685650', 'manisha@gmail.com', 'Manisha', 'Manisha@123', 'Admin', 'Pune', '2026-07-25 13:05:53', '2026-07-27 06:23:26', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `Customer_id` int(11) NOT NULL,
  `Customer_Code` varchar(100) NOT NULL,
  `Customer_Name` varchar(255) NOT NULL,
  `Company_Name` varchar(255) NOT NULL,
  `Company_Address` varchar(255) NOT NULL,
  `Delivery_Address` varchar(255) NOT NULL,
  `GST_No` varchar(255) NOT NULL,
  `Customer_PhoneNo` varchar(100) NOT NULL,
  `Customer_Email` varchar(100) NOT NULL,
  `Customer_Status` varchar(100) NOT NULL,
  `Added_Date` timestamp NOT NULL DEFAULT current_timestamp(),
  `Updated_Date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`Customer_id`, `Customer_Code`, `Customer_Name`, `Company_Name`, `Company_Address`, `Delivery_Address`, `GST_No`, `Customer_PhoneNo`, `Customer_Email`, `Customer_Status`, `Added_Date`, `Updated_Date`) VALUES
(1, 'CUST_1', 'Vikas Tiwaskar', 'Fourth Dimension', 'Gera Imperium Alpha, Kharadi, Pune.', 'Gera Imperium Alpha, Kharadi, Pune.', '27AAA23457433', '9145125452', 'fourthdimension', 'InActive', '2026-07-15 12:18:00', '2026-07-15 12:18:00'),
(4, 'CUST_2', 'Manisha Kulkarni', 'New Fourthdm', 'Pune', 'Pune', '27AA5685874352', '9856895690', 'manisha@gmail.com', 'Active', '2026-07-23 07:19:13', '2026-07-23 07:19:13'),
(5, 'CUST_3', 'Amol More', 'Morya Enterprises', 'Khandve nagar Kharadi, pune.', '', '27AAA345245', '8956326598', 'amol@gmail.com', 'Active', '2026-07-27 04:48:27', '2026-07-27 04:48:27');

-- --------------------------------------------------------

--
-- Table structure for table `inletchallan`
--

CREATE TABLE `inletchallan` (
  `Challan_id` int(11) NOT NULL,
  `Challan_Code` varchar(100) NOT NULL,
  `Customer_Name` varchar(255) NOT NULL,
  `Company_Name` varchar(255) NOT NULL,
  `Company_Address` varchar(255) NOT NULL,
  `GST_No` varchar(255) NOT NULL,
  `Delivery_Address` varchar(255) NOT NULL,
  `Sub_Total` decimal(12,2) NOT NULL,
  `Total_Amount` decimal(12,2) NOT NULL,
  `Discount_Amount` decimal(12,2) NOT NULL,
  `CGST_amount` decimal(12,2) NOT NULL,
  `SGST_amount` decimal(12,2) NOT NULL,
  `Grand_Total` decimal(12,2) NOT NULL,
  `Mode_of_Transport` varchar(255) NOT NULL,
  `Transporter_Name` varchar(255) NOT NULL,
  `Vehicle_Number` varchar(100) NOT NULL,
  `Remark` text NOT NULL,
  `Work_Status` varchar(100) NOT NULL,
  `Delivery_Status` varchar(100) NOT NULL,
  `Challan_Status` varchar(100) NOT NULL,
  `Added_Date` timestamp NOT NULL DEFAULT current_timestamp(),
  `Updated_Date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inletchallan`
--

INSERT INTO `inletchallan` (`Challan_id`, `Challan_Code`, `Customer_Name`, `Company_Name`, `Company_Address`, `GST_No`, `Delivery_Address`, `Sub_Total`, `Total_Amount`, `Discount_Amount`, `CGST_amount`, `SGST_amount`, `Grand_Total`, `Mode_of_Transport`, `Transporter_Name`, `Vehicle_Number`, `Remark`, `Work_Status`, `Delivery_Status`, `Challan_Status`, `Added_Date`, `Updated_Date`) VALUES
(4, 'CH_20260723_01', 'Manisha Kulkarni', 'New Fourthdm', 'Pune', '27AA5685874352', 'Kharadi,Pune', 20500.00, 20500.00, 0.00, 1845.00, 1845.00, 24190.00, 'Road Transport', 'New Demo', 'MH 12 AD 8818', 'Normal', 'Hold', 'In Transport', 'Open', '2026-07-23 07:21:26', '2026-07-23 11:50:11'),
(5, 'CH_20260727_01', 'Amol More', 'Morya Enterprises', 'Khandve nagar Kharadi, pune.', '27AAA345245', '', 50000.00, 45000.00, 5000.00, 4050.00, 4050.00, 53100.00, 'Road Transport', 'New Demo', 'MH 14 AD 3434', 'Goods ', 'In Queue', 'Not Delivered', 'Open', '2026-07-27 06:01:21', '2026-07-27 06:01:21');

--
-- Triggers `inletchallan`
--
DELIMITER $$
CREATE TRIGGER `trg_inletchallan_history` AFTER UPDATE ON `inletchallan` FOR EACH ROW BEGIN

INSERT INTO inletchallan_history
(
    Challan_id,
    old_header,
    new_header
)

VALUES
(
    OLD.Challan_id,

    JSON_OBJECT(

        'Customer_Name',OLD.Customer_Name,
        'Company_Name',OLD.Company_Name,
        'Company_Address',OLD.Company_Address,
        'GST_No',OLD.GST_No,
        'Delivery_Address',OLD.Delivery_Address,
        'Sub_Total',OLD.Sub_Total,
        'Total_Amount',OLD.Total_Amount,
        'Discount_Amount',OLD.Discount_Amount,
        'CGST_amount',OLD.CGST_amount,
        'SGST_amount',OLD.SGST_amount,
        'Grand_Total',OLD.Grand_Total,
        'Mode_of_Transport',OLD.Mode_of_Transport,
        'Transporter_Name',OLD.Transporter_Name,
        'Vehicle_Number',OLD.Vehicle_Number,
        'Remark',OLD.Remark,
        'Work_Status',OLD.Work_Status,
        'Delivery_Status',OLD.Delivery_Status,
        'Challan_Status',OLD.Challan_Status,
        'Added_Date',OLD.Added_Date,
        'Updated_Date',OLD.Updated_Date
    ),

    JSON_OBJECT(

        'Customer_Name',NEW.Customer_Name,
        'Company_Name',NEW.Company_Name,
        'Company_Address',NEW.Company_Address,
        'GST_No',NEW.GST_No,
        'Delivery_Address',NEW.Delivery_Address,
        'Sub_Total',NEW.Sub_Total,
        'Total_Amount',NEW.Total_Amount,
        'Discount_Amount',NEW.Discount_Amount,
        'CGST_amount',NEW.CGST_amount,
        'SGST_amount',NEW.SGST_amount,
        'Grand_Total',NEW.Grand_Total,
        'Mode_of_Transport',NEW.Mode_of_Transport,
        'Transporter_Name',NEW.Transporter_Name,
        'Vehicle_Number',NEW.Vehicle_Number,
        'Remark',NEW.Remark,
        'Work_Status',NEW.Work_Status,
        'Delivery_Status',NEW.Delivery_Status,
        'Challan_Status',NEW.Challan_Status,
         'Added_Date',OLD.Added_Date,
        'Updated_Date',OLD.Updated_Date
    )
);

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `inletchallan_history`
--

CREATE TABLE `inletchallan_history` (
  `History_Id` int(11) NOT NULL,
  `Challan_id` int(11) DEFAULT NULL,
  `old_header` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_header`)),
  `new_header` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_header`)),
  `Updated_Date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inletchallan_history`
--

INSERT INTO `inletchallan_history` (`History_Id`, `Challan_id`, `old_header`, `new_header`, `Updated_Date`) VALUES
(1, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Pune\", \"Sub_Total\": 34000.00, \"Total_Amount\": 29000.00, \"Discount_Amount\": 5000.00, \"CGST_amount\": 2610.00, \"SGST_amount\": 2610.00, \"Grand_Total\": 34220.00, \"Remark\": \"Normal\", \"Work_Status\": \"In Queue\", \"Delivery_Status\": \"In Transport\", \"Challan_Status\": \"Open\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Pune\", \"Sub_Total\": 34000.00, \"Total_Amount\": 34000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 3060.00, \"SGST_amount\": 3060.00, \"Grand_Total\": 40120.00, \"Remark\": \"Normal\", \"Work_Status\": \"Hold\", \"Delivery_Status\": \"In Transport\", \"Challan_Status\": \"Open\"}', '2026-07-23 12:51:57'),
(2, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Pune\", \"Sub_Total\": 34000.00, \"Total_Amount\": 34000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 3060.00, \"SGST_amount\": 3060.00, \"Grand_Total\": 40120.00, \"Remark\": \"Normal\", \"Work_Status\": \"Hold\", \"Delivery_Status\": \"In Transport\", \"Challan_Status\": \"Open\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi Pune\", \"Sub_Total\": 34000.00, \"Total_Amount\": 30000.00, \"Discount_Amount\": 4000.00, \"CGST_amount\": 2700.00, \"SGST_amount\": 2700.00, \"Grand_Total\": 35400.00, \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"In Transport\", \"Challan_Status\": \"Open\"}', '2026-07-23 13:10:28'),
(3, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi Pune\", \"Sub_Total\": 34000.00, \"Total_Amount\": 30000.00, \"Discount_Amount\": 4000.00, \"CGST_amount\": 2700.00, \"SGST_amount\": 2700.00, \"Grand_Total\": 35400.00, \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"In Transport\", \"Challan_Status\": \"Open\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 20500.00, \"Total_Amount\": 20500.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 1845.00, \"SGST_amount\": 1845.00, \"Grand_Total\": 24190.00, \"Remark\": \"Normal\", \"Work_Status\": \"Breakdown\", \"Delivery_Status\": \"In Transport\", \"Challan_Status\": \"Open\"}', '2026-07-23 15:22:38'),
(4, 2, '{\"Customer_Name\": \"New Fourthdm\", \"Company_Name\": \"Fourth_Dimension\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AAA12454599656\", \"Delivery_Address\": \"Kharadi\", \"Sub_Total\": 3500.00, \"Total_Amount\": 3500.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 315.00, \"SGST_amount\": 315.00, \"Grand_Total\": 4130.00, \"Remark\": \"Goods\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\"}', '{\"Customer_Name\": \"New Fourthdm\", \"Company_Name\": \"Fourth_Dimension\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AAA12454599656\", \"Delivery_Address\": \"Kharadi\", \"Sub_Total\": 6000.00, \"Total_Amount\": 5500.00, \"Discount_Amount\": 500.00, \"CGST_amount\": 495.00, \"SGST_amount\": 495.00, \"Grand_Total\": 6490.00, \"Remark\": \"Goods\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\"}', '2026-07-23 15:58:43'),
(5, 2, '{\"Customer_Name\": \"New Fourthdm\", \"Company_Name\": \"Fourth_Dimension\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AAA12454599656\", \"Delivery_Address\": \"Kharadi\", \"Sub_Total\": 6000.00, \"Total_Amount\": 5500.00, \"Discount_Amount\": 500.00, \"CGST_amount\": 495.00, \"SGST_amount\": 495.00, \"Grand_Total\": 6490.00, \"Remark\": \"Goods\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\"}', '{\"Customer_Name\": \"New Fourthdm\", \"Company_Name\": \"Fourth_Dimension\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AAA12454599656\", \"Delivery_Address\": \"Kharadi\", \"Sub_Total\": 5000.00, \"Total_Amount\": 5000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 450.00, \"SGST_amount\": 450.00, \"Grand_Total\": 5900.00, \"Remark\": \"Goods\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\"}', '2026-07-23 16:32:29'),
(6, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 20500.00, \"Total_Amount\": 20500.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 1845.00, \"SGST_amount\": 1845.00, \"Grand_Total\": 24190.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AD 4888\", \"Remark\": \"Normal\", \"Work_Status\": \"Breakdown\", \"Delivery_Status\": \"In Transport\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-23 15:22:38\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 20500.00, \"Total_Amount\": 20500.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 1845.00, \"SGST_amount\": 1845.00, \"Grand_Total\": 24190.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Hold\", \"Delivery_Status\": \"In Transport\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-23 15:22:38\"}', '2026-07-23 17:20:11'),
(7, 2, '{\"Customer_Name\": \"New Fourthdm\", \"Company_Name\": \"Fourth_Dimension\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AAA12454599656\", \"Delivery_Address\": \"Kharadi\", \"Sub_Total\": 5000.00, \"Total_Amount\": 5000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 450.00, \"SGST_amount\": 450.00, \"Grand_Total\": 5900.00, \"Mode_of_Transport\": \"Vehicle\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AB 2322\", \"Remark\": \"Goods\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-17 13:04:18\", \"Updated_Date\": \"2026-07-23 16:32:29\"}', '{\"Customer_Name\": \"New Fourthdm\", \"Company_Name\": \"Fourth_Dimension\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AAA12454599656\", \"Delivery_Address\": \"Kharadi\", \"Sub_Total\": 5000.00, \"Total_Amount\": 5000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 450.00, \"SGST_amount\": 450.00, \"Grand_Total\": 5900.00, \"Mode_of_Transport\": \"Vehicle\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AB 2322\", \"Remark\": \"Goods\", \"Work_Status\": \"Completed\", \"Delivery_Status\": \"Delivered\", \"Challan_Status\": \"Close\", \"Added_Date\": \"2026-07-17 13:04:18\", \"Updated_Date\": \"2026-07-23 16:32:29\"}', '2026-07-24 09:49:47');

-- --------------------------------------------------------

--
-- Table structure for table `inletproducts`
--

CREATE TABLE `inletproducts` (
  `InletProduct_id` int(11) NOT NULL,
  `Challan_id` int(11) NOT NULL,
  `Product_Name` varchar(255) NOT NULL,
  `HSN_Code` varchar(100) NOT NULL,
  `Product_Quantity` int(11) NOT NULL,
  `Rate` decimal(10,2) NOT NULL,
  `SubTotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inletproducts`
--

INSERT INTO `inletproducts` (`InletProduct_id`, `Challan_id`, `Product_Name`, `HSN_Code`, `Product_Quantity`, `Rate`, `SubTotal`) VALUES
(10, 3, 'Cutter', '134512', 25, 1000.00, 25000.00),
(11, 3, 'Sheet', '112548', 10, 1000.00, 10000.00),
(34, 4, 'Mill', '1542145', 10, 1500.00, 15000.00),
(35, 4, 'Cutter', '14515', 20, 200.00, 4000.00),
(36, 4, 'Drill', '114515', 1, 1500.00, 1500.00),
(39, 5, 'Mill', '152451', 20, 1000.00, 20000.00),
(40, 5, 'Cutters', '115145', 15, 2000.00, 30000.00);

-- --------------------------------------------------------

--
-- Table structure for table `inletproducts_history`
--

CREATE TABLE `inletproducts_history` (
  `History_Id` int(11) NOT NULL,
  `Challan_id` int(11) DEFAULT NULL,
  `InletProduct_id` int(11) DEFAULT NULL,
  `old_product` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_product`)),
  `new_product` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_product`)),
  `Updated_Date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vendor`
--

CREATE TABLE `vendor` (
  `Vendor_id` int(11) NOT NULL,
  `Vendor_Code` varchar(100) NOT NULL,
  `Vendor_Name` varchar(255) NOT NULL,
  `Vendor_CompanyName` varchar(255) NOT NULL,
  `VendorGST_No` varchar(255) NOT NULL,
  `Vendor_Phoneno` varchar(100) NOT NULL,
  `Vendor_Email` varchar(255) NOT NULL,
  `Vendor_CompanyAddress` varchar(255) NOT NULL,
  `Added_Date` timestamp NOT NULL DEFAULT current_timestamp(),
  `Updated_Date` timestamp NOT NULL DEFAULT current_timestamp(),
  `Vendor_Status` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendor`
--

INSERT INTO `vendor` (`Vendor_id`, `Vendor_Code`, `Vendor_Name`, `Vendor_CompanyName`, `VendorGST_No`, `Vendor_Phoneno`, `Vendor_Email`, `Vendor_CompanyAddress`, `Added_Date`, `Updated_Date`, `Vendor_Status`) VALUES
(1, 'VENDOR_1', 'Mindscrafts', 'Mindscrafts Solution Pvt Ltd.', '27AAD453635363', '8965451245', 'mind@gmail.com', 'Pune', '2026-07-16 11:05:02', '2026-07-16 11:05:02', 'Active'),
(3, 'VENDOR_2', 'New', 'Fourth Dimension', '27AAA5647372', '9864578451', 'new@gmail.com', 'Kharadi,Pune.', '2026-07-16 11:21:12', '2026-07-16 11:21:12', 'Active'),
(4, 'VENDOR_3', 'Shridhar ', 'New ', '27AAA4347358', '9856235689', 'shridhar@gmail.com', 'Pune', '2026-07-27 05:35:46', '2026-07-27 05:35:46', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `vendorchallan`
--

CREATE TABLE `vendorchallan` (
  `VendorChallan_id` int(11) NOT NULL,
  `VendorChallan_Code` varchar(100) NOT NULL,
  `Vendor_Name` varchar(255) NOT NULL,
  `Vendor_CompanyName` varchar(255) NOT NULL,
  `Vendor_CompanyAddress` varchar(255) NOT NULL,
  `VendorGST_No` varchar(255) NOT NULL,
  `Vendor_Phoneno` varchar(100) NOT NULL,
  `Vendor_Email` varchar(100) NOT NULL,
  `Sub_Total` decimal(12,2) NOT NULL,
  `Total_Amount` decimal(12,2) NOT NULL,
  `CGST_amount` decimal(12,2) NOT NULL,
  `SGST_amount` decimal(12,2) NOT NULL,
  `Grand_Total` decimal(12,2) NOT NULL,
  `Mode_of_Transport` varchar(255) NOT NULL,
  `Transporter_Name` varchar(255) NOT NULL,
  `Vehicle_Number` varchar(100) NOT NULL,
  `Remark` text NOT NULL,
  `Product_Status` varchar(100) NOT NULL,
  `Delivery_Status` varchar(100) NOT NULL,
  `Challan_Status` varchar(100) NOT NULL,
  `Added_Date` timestamp NOT NULL DEFAULT current_timestamp(),
  `Updated_Date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendorchallan`
--

INSERT INTO `vendorchallan` (`VendorChallan_id`, `VendorChallan_Code`, `Vendor_Name`, `Vendor_CompanyName`, `Vendor_CompanyAddress`, `VendorGST_No`, `Vendor_Phoneno`, `Vendor_Email`, `Sub_Total`, `Total_Amount`, `CGST_amount`, `SGST_amount`, `Grand_Total`, `Mode_of_Transport`, `Transporter_Name`, `Vehicle_Number`, `Remark`, `Product_Status`, `Delivery_Status`, `Challan_Status`, `Added_Date`, `Updated_Date`) VALUES
(5, 'VC_20260727_01', 'Shridhar ', 'New ', 'Pune', '27AAA4347358', '9856235689', 'shridhar@gmail.com', 20000.00, 20000.00, 1800.00, 1800.00, 23600.00, 'Road Transport', 'Demo', 'MH 14 AD 2356', 'Goods', 'Not Received', 'Dispatched', 'Open', '2026-07-27 06:09:50', '2026-07-27 06:09:50');

--
-- Triggers `vendorchallan`
--
DELIMITER $$
CREATE TRIGGER `trg_Vendorchallan_history` AFTER UPDATE ON `vendorchallan` FOR EACH ROW BEGIN

INSERT INTO Vendorchallan_history
(
    VendorChallan_id,
    old_vendorchallan,
    new_vendorchallan
)

VALUES
(
    OLD.VendorChallan_id,

    JSON_OBJECT(
        'VendorChallan_Code',OLD.VendorChallan_Code,
        'Vendor_Name',OLD.Vendor_Name,
        'Vendor_CompanyName',OLD.Vendor_CompanyName,
        'Vendor_CompanyAddress',OLD.Vendor_CompanyAddress,
        'VendorGST_No',OLD.VendorGST_No,
        'Vendor_Phoneno',OLD.Vendor_Phoneno,
        'Vendor_Email',OLD.Vendor_Email,
        'Sub_Total',OLD.Sub_Total,
        'Total_Amount',OLD.Total_Amount,
        'CGST_amount',OLD.CGST_amount,
        'SGST_amount',OLD.SGST_amount,
        'Grand_Total',OLD.Grand_Total,
        'Mode_of_Transport',OLD.Mode_of_Transport,
        'Transporter_Name',OLD.Transporter_Name,
        'Vehicle_Number',OLD.Vehicle_Number,
        'Remark',OLD.Remark,
        'Product_Status',OLD.Product_Status,
        'Delivery_Status',OLD.Delivery_Status,
        'Challan_Status',OLD.Challan_Status,
        'Added_Date',OLD.Added_Date,
        'Updated_Date',OLD.Updated_Date
    ),

    JSON_OBJECT(

        'VendorChallan_Code',NEW.VendorChallan_Code,
        'Vendor_Name',NEW.Vendor_Name,
        'Vendor_CompanyName',NEW.Vendor_CompanyName,
        'Vendor_CompanyAddress',NEW.Vendor_CompanyAddress,
        'VendorGST_No',NEW.VendorGST_No,
        'Vendor_Phoneno',NEW.Vendor_Phoneno,
        'Vendor_Email',NEW.Vendor_Email,
        'Sub_Total',NEW.Sub_Total,
        'Total_Amount',NEW.Total_Amount,
        'CGST_amount',NEW.CGST_amount,
        'SGST_amount',NEW.SGST_amount,
        'Grand_Total',NEW.Grand_Total,
        'Mode_of_Transport',NEW.Mode_of_Transport,
        'Transporter_Name',NEW.Transporter_Name,
        'Vehicle_Number',NEW.Vehicle_Number,
        'Remark',NEW.Remark,
        'Product_Status',NEW.Product_Status,
        'Delivery_Status',NEW.Delivery_Status,
        'Challan_Status',NEW.Challan_Status,
        'Added_Date',NEW.Added_Date,
        'Updated_Date',NEW.Updated_Date
    )
);

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `vendorchallan_history`
--

CREATE TABLE `vendorchallan_history` (
  `History_Id` int(11) NOT NULL,
  `VendorChallan_id` int(11) DEFAULT NULL,
  `old_vendorchallan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_vendorchallan`)),
  `new_vendorchallan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_vendorchallan`)),
  `Updated_Date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendorchallan_history`
--

INSERT INTO `vendorchallan_history` (`History_Id`, `VendorChallan_id`, `old_vendorchallan`, `new_vendorchallan`, `Updated_Date`) VALUES
(1, 3, '{\"VendorChallan_Code\": \"VC_20260722_03\", \"Vendor_Name\": \"Mindscrafts\", \"Vendor_CompanyName\": \"Mindscrafts Solution Pvt Ltd.\", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAD453635363\", \"Vendor_Phoneno\": \"8965451245\", \"Vendor_Email\": \"mind@gmail.com\", \"Sub_Total\": 2000.00, \"Total_Amount\": 2000.00, \"CGST_amount\": 180.00, \"SGST_amount\": 180.00, \"Grand_Total\": 2360.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AK 2223\", \"Remark\": \"Good\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-22 14:37:04\", \"Updated_Date\": \"2026-07-22 14:37:04\"}', '{\"VendorChallan_Code\": \"VC_20260722_03\", \"Vendor_Name\": \"Mindscrafts\", \"Vendor_CompanyName\": \"Mindscrafts Solution Pvt Ltd.\", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAD453635363\", \"Vendor_Phoneno\": \"8965451245\", \"Vendor_Email\": \"mind@gmail.com\", \"Sub_Total\": 1000.00, \"Total_Amount\": 1000.00, \"CGST_amount\": 90.00, \"SGST_amount\": 90.00, \"Grand_Total\": 1180.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AK 2223\", \"Remark\": \"Good\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Delivered\", \"Challan_Status\": \"Close\", \"Added_Date\": \"2026-07-22 14:37:04\", \"Updated_Date\": \"2026-07-24 09:55:25\"}', '2026-07-24 09:55:25'),
(2, 3, '{\"VendorChallan_Code\": \"VC_20260722_03\", \"Vendor_Name\": \"Mindscrafts\", \"Vendor_CompanyName\": \"Mindscrafts Solution Pvt Ltd.\", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAD453635363\", \"Vendor_Phoneno\": \"8965451245\", \"Vendor_Email\": \"mind@gmail.com\", \"Sub_Total\": 1000.00, \"Total_Amount\": 1000.00, \"CGST_amount\": 90.00, \"SGST_amount\": 90.00, \"Grand_Total\": 1180.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AK 2223\", \"Remark\": \"Good\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Delivered\", \"Challan_Status\": \"Close\", \"Added_Date\": \"2026-07-22 14:37:04\", \"Updated_Date\": \"2026-07-24 09:55:25\"}', '{\"VendorChallan_Code\": \"VC_20260722_03\", \"Vendor_Name\": \"Mindscrafts\", \"Vendor_CompanyName\": \"Mindscrafts Solution Pvt Ltd.\", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAD453635363\", \"Vendor_Phoneno\": \"8965451245\", \"Vendor_Email\": \"mind@gmail.com\", \"Sub_Total\": 1000.00, \"Total_Amount\": 1000.00, \"CGST_amount\": 90.00, \"SGST_amount\": 90.00, \"Grand_Total\": 1180.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AK 2223\", \"Remark\": \"Good\", \"Product_Status\": \"Received\", \"Delivery_Status\": \"Delivered\", \"Challan_Status\": \"Close\", \"Added_Date\": \"2026-07-22 14:37:04\", \"Updated_Date\": \"2026-07-24 10:00:29\"}', '2026-07-24 10:00:29');

-- --------------------------------------------------------

--
-- Table structure for table `vendorproducts`
--

CREATE TABLE `vendorproducts` (
  `VendorProduct_id` int(11) NOT NULL,
  `VendorChallan_id` int(11) NOT NULL,
  `Product_Name` varchar(255) NOT NULL,
  `HSN_Code` varchar(255) NOT NULL,
  `Operation_Perform` varchar(255) NOT NULL,
  `Product_Quantity` int(11) NOT NULL,
  `Rate` decimal(12,2) NOT NULL,
  `SubTotal` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendorproducts`
--

INSERT INTO `vendorproducts` (`VendorProduct_id`, `VendorChallan_id`, `Product_Name`, `HSN_Code`, `Operation_Perform`, `Product_Quantity`, `Rate`, `SubTotal`) VALUES
(7, 5, 'Mill', '2745AAAA2324', 'Sparking', 20, 1000.00, 20000.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`Admin_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`Customer_id`);

--
-- Indexes for table `inletchallan`
--
ALTER TABLE `inletchallan`
  ADD PRIMARY KEY (`Challan_id`);

--
-- Indexes for table `inletchallan_history`
--
ALTER TABLE `inletchallan_history`
  ADD PRIMARY KEY (`History_Id`);

--
-- Indexes for table `inletproducts`
--
ALTER TABLE `inletproducts`
  ADD PRIMARY KEY (`InletProduct_id`);

--
-- Indexes for table `inletproducts_history`
--
ALTER TABLE `inletproducts_history`
  ADD PRIMARY KEY (`History_Id`);

--
-- Indexes for table `vendor`
--
ALTER TABLE `vendor`
  ADD PRIMARY KEY (`Vendor_id`);

--
-- Indexes for table `vendorchallan`
--
ALTER TABLE `vendorchallan`
  ADD PRIMARY KEY (`VendorChallan_id`);

--
-- Indexes for table `vendorchallan_history`
--
ALTER TABLE `vendorchallan_history`
  ADD PRIMARY KEY (`History_Id`);

--
-- Indexes for table `vendorproducts`
--
ALTER TABLE `vendorproducts`
  ADD PRIMARY KEY (`VendorProduct_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `Admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `Customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `inletchallan`
--
ALTER TABLE `inletchallan`
  MODIFY `Challan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `inletchallan_history`
--
ALTER TABLE `inletchallan_history`
  MODIFY `History_Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `inletproducts`
--
ALTER TABLE `inletproducts`
  MODIFY `InletProduct_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `inletproducts_history`
--
ALTER TABLE `inletproducts_history`
  MODIFY `History_Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vendor`
--
ALTER TABLE `vendor`
  MODIFY `Vendor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `vendorchallan`
--
ALTER TABLE `vendorchallan`
  MODIFY `VendorChallan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `vendorchallan_history`
--
ALTER TABLE `vendorchallan_history`
  MODIFY `History_Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `vendorproducts`
--
ALTER TABLE `vendorproducts`
  MODIFY `VendorProduct_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
