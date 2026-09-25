-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 25, 2026 at 06:25 AM
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
(1, 'ADM_1', 'Vikas Tiwaskar', '7709892292', 'vikas@gmail.com', 'Admin', 'Admin@123', 'Admin', 'Pune', '2026-07-13 09:39:11', '2026-08-11 06:02:05', 'Active'),
(7, 'ADM_2', 'Manisha Kulkarni', '9856895689', 'manisha@gmail.com', 'Manisha', 'Manisha@123', 'Admin', 'Pune', '2026-09-10 07:31:16', '2026-09-10 07:31:37', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `admin_deletion_history`
--

CREATE TABLE `admin_deletion_history` (
  `AdminDeletion_id` int(11) NOT NULL,
  `Admin_id` int(11) NOT NULL,
  `Code` varchar(100) DEFAULT NULL,
  `Deleted_By_Admin_id` int(11) NOT NULL,
  `Deleted_By_Admin_Name` varchar(255) DEFAULT NULL,
  `Deletion_Reason` text NOT NULL,
  `Deleted_Date` datetime DEFAULT current_timestamp(),
  `Admin_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Admin_Data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_deletion_history`
--

INSERT INTO `admin_deletion_history` (`AdminDeletion_id`, `Admin_id`, `Code`, `Deleted_By_Admin_id`, `Deleted_By_Admin_Name`, `Deletion_Reason`, `Deleted_Date`, `Admin_Data`) VALUES
(1, 6, 'ADM_4', 1, 'Vikas Tiwaskar', 'Admin is not active.', '2026-09-10 12:50:04', '{\"Admin_id\":6,\"Code\":\"ADM_4\",\"Name\":\"Manisha Kulkarni\",\"PhoneNo\":\"9015954815\",\"Email\":\"manishakk@gmail.com\",\"Username\":\"Manisha\",\"Password\":\"Manisha@123\",\"Role\":\"Admin\",\"Address\":\"Pune\",\"Added_Date\":\"2026-07-25T13:05:53.000Z\",\"Updated_Date\":\"2026-08-11T10:43:50.000Z\",\"Status\":\"Active\"}');

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
(5, 'CUST_3', 'Amol More', 'Morya Enterprises', 'Khandve nagar Kharadi, pune.', 'Kharadi, Pune', '27AAA115125', '8956326598', 'amol@gmail.com', 'Active', '2026-07-27 04:48:27', '2026-08-11 06:21:43'),
(6, 'CUST_4', 'Varsha Mane', 'Varsha Industry', 'Sangali', 'Pune', '28AADD11125452213', '9856895522', 'varsha@gmail.com', 'Active', '2026-09-10 09:02:36', '2026-09-10 09:02:36'),
(7, 'CUST_5', 'Shubham Navle', 'Shubham Industries', 'Pimpri Chinchvad.', 'Pimpri.', '27AAA2455463', '9856895205', 'shubham@gmail.com', 'Active', '2026-09-24 06:34:18', '2026-09-24 06:34:18');

-- --------------------------------------------------------

--
-- Table structure for table `customer_deletion_history`
--

CREATE TABLE `customer_deletion_history` (
  `CustomerDeletion_id` int(11) NOT NULL,
  `Customer_id` int(11) NOT NULL,
  `Customer_Code` varchar(100) DEFAULT NULL,
  `Deleted_By_Admin_id` int(11) NOT NULL,
  `Deleted_By_Admin_Name` varchar(255) DEFAULT NULL,
  `Deletion_Reason` text NOT NULL,
  `Deleted_Date` datetime DEFAULT current_timestamp(),
  `Customer_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Customer_Data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_deletion_history`
--

INSERT INTO `customer_deletion_history` (`CustomerDeletion_id`, `Customer_id`, `Customer_Code`, `Deleted_By_Admin_id`, `Deleted_By_Admin_Name`, `Deletion_Reason`, `Deleted_Date`, `Customer_Data`) VALUES
(1, 4, 'CUST_2', 1, 'Vikas Tiwaskar', 'Customer is now not active.', '2026-09-10 11:57:11', '{\"Customer_id\":4,\"Customer_Code\":\"CUST_2\",\"Customer_Name\":\"Manisha Kulkarni\",\"Company_Name\":\"New Fourthdm\",\"Company_Address\":\"Pune\",\"Delivery_Address\":\"Pune\",\"GST_No\":\"27AAA8541201\",\"Customer_PhoneNo\":\"9856895690\",\"Customer_Email\":\"manisha@gmail.com\",\"Customer_Status\":\"Active\",\"Added_Date\":\"2026-07-23T07:19:13.000Z\",\"Updated_Date\":\"2026-08-11T06:28:23.000Z\"}');

-- --------------------------------------------------------

--
-- Table structure for table `inletchallan`
--

CREATE TABLE `inletchallan` (
  `Challan_id` int(11) NOT NULL,
  `Challan_Code` varchar(100) NOT NULL,
  `Sales_Order_Number` varchar(100) DEFAULT NULL,
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

INSERT INTO `inletchallan` (`Challan_id`, `Challan_Code`, `Sales_Order_Number`, `Customer_Name`, `Company_Name`, `Company_Address`, `GST_No`, `Delivery_Address`, `Sub_Total`, `Total_Amount`, `Discount_Amount`, `CGST_amount`, `SGST_amount`, `Grand_Total`, `Mode_of_Transport`, `Transporter_Name`, `Vehicle_Number`, `Remark`, `Work_Status`, `Delivery_Status`, `Challan_Status`, `Added_Date`, `Updated_Date`) VALUES
(7, 'CH_20260801_02', NULL, 'Manisha Kulkarni', 'New Fourthdm', 'Pune', '27AA5685874352', 'Pune', 24000.00, 23000.00, 1000.00, 2070.00, 2070.00, 27140.00, 'Air Transport', 'Shubham', 'MH 12 HD 3414', 'Goods', 'In Queue', 'Not Delivered', 'Open', '2026-08-01 05:22:33', '2026-08-01 05:22:33'),
(8, 'CH_20260801_03', NULL, 'Manisha Kulkarni', 'New Fourthdm', 'Pune', '27AA5685874352', 'Pune', 30000.00, 29000.00, 1000.00, 2610.00, 2610.00, 34220.00, 'Road Transport', 'Shubham', 'MH 11 MK4414', 'Goods', 'In Queue', 'Not Delivered', 'Open', '2026-08-01 05:24:20', '2026-08-01 05:24:20'),
(9, 'CH_20260803_01', NULL, 'Manisha Kulkarni', 'New Fourthdm', 'Pune', '27AA5685874352', 'Pune', 85000.00, 80000.00, 5000.00, 7200.00, 7200.00, 94400.00, 'Road Transport', 'Demo ', 'MH 44 AB 1212', 'Goods', 'Breakdown', 'Not Delivered', 'Open', '2026-08-03 11:07:23', '2026-08-03 12:53:02'),
(10, 'CH_202609_01', NULL, 'Amol More', 'Morya Enterprises', 'Khandve nagar Kharadi, pune.', '27AAA115125', 'Kharadi, Pune', 75000.00, 75000.00, 0.00, 6750.00, 6750.00, 88500.00, 'Road Transport', '', '', '', 'In Queue', 'Not Delivered', 'Open', '2026-09-10 09:00:45', '2026-09-10 09:00:45'),
(11, 'CH_202609_02', NULL, 'Varsha Mane', 'Varsha Industry', 'Sangali', '28AADD11125452213', 'Pune', 99900.00, 94900.00, 5000.00, 8541.00, 8541.00, 111982.00, 'Road Transport', '', '', '', 'In Queue', 'Not Delivered', 'Open', '2026-09-10 09:04:31', '2026-09-10 09:04:31');

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
-- Table structure for table `inletchallan_deletion_history`
--

CREATE TABLE `inletchallan_deletion_history` (
  `Deletionchallan_id` int(11) NOT NULL,
  `Challan_id` int(11) NOT NULL,
  `Challan_Code` varchar(100) DEFAULT NULL,
  `Deleted_By_Admin_id` int(11) NOT NULL,
  `Deleted_By_Admin_Name` varchar(255) DEFAULT NULL,
  `Deletion_Reason` text NOT NULL,
  `Deleted_Date` datetime DEFAULT current_timestamp(),
  `Challan_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Challan_Data`)),
  `Product_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Product_Data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inletchallan_deletion_history`
--

INSERT INTO `inletchallan_deletion_history` (`Deletionchallan_id`, `Challan_id`, `Challan_Code`, `Deleted_By_Admin_id`, `Deleted_By_Admin_Name`, `Deletion_Reason`, `Deleted_Date`, `Challan_Data`, `Product_Data`) VALUES
(6, 5, 'CH_20260727_01', 1, 'Vikas Tiwaskar', 'Customer Not found.', '2026-09-08 15:31:39', '{\"Challan_id\":5,\"Challan_Code\":\"CH_20260727_01\",\"Customer_Name\":\"Amol More\",\"Company_Name\":\"Morya Enterprises\",\"Company_Address\":\"Khandve nagar Kharadi, pune.\",\"GST_No\":\"27AAA345245\",\"Delivery_Address\":\"Pune\",\"Sub_Total\":90000,\"Total_Amount\":90000,\"Discount_Amount\":0,\"CGST_amount\":8100,\"SGST_amount\":8100,\"Grand_Total\":106200,\"Mode_of_Transport\":\"Road Transport\",\"Transporter_Name\":\"New Demo\",\"Vehicle_Number\":\"MH 14 AD 3434\",\"Remark\":\"Goods \",\"Work_Status\":\"Processing\",\"Delivery_Status\":\"Not Delivered\",\"Challan_Status\":\"Not Close\",\"Added_Date\":\"2026-07-27T06:01:21.000Z\",\"Updated_Date\":\"2026-07-29T09:20:22.000Z\"}', '[{\"InletProduct_id\":56,\"Challan_id\":5,\"Product_Name\":\"Mills\",\"HSN_Code\":\"111215\",\"Product_Quantity\":100,\"Rate\":500,\"SubTotal\":50000},{\"InletProduct_id\":57,\"Challan_id\":5,\"Product_Name\":\"Cutters\",\"HSN_Code\":\"115145\",\"Product_Quantity\":20,\"Rate\":2000,\"SubTotal\":40000}]'),
(7, 6, 'CH_20260801_01', 7, 'Manisha Kulkarni', 'Inlet challan Deleted.', '2026-09-10 14:08:24', '{\"Challan_id\":6,\"Challan_Code\":\"CH_20260801_01\",\"Customer_Name\":\"Vikas Tiwaskar\",\"Company_Name\":\"Fourth Dimension\",\"Company_Address\":\"Gera Imperium Alpha, Kharadi, Pune.\",\"GST_No\":\"27AAA23457433\",\"Delivery_Address\":\"Gera Imperium Alpha, Kharadi, Pune.\",\"Sub_Total\":55000,\"Total_Amount\":53000,\"Discount_Amount\":2000,\"CGST_amount\":4770,\"SGST_amount\":4770,\"Grand_Total\":62540,\"Mode_of_Transport\":\"Road Transport\",\"Transporter_Name\":\"Pallavi \",\"Vehicle_Number\":\"MH14HG1212\",\"Remark\":\"Check before giving receiver sign\",\"Work_Status\":\"In Queue\",\"Delivery_Status\":\"Not Delivered\",\"Challan_Status\":\"Open\",\"Added_Date\":\"2026-08-01T05:18:17.000Z\",\"Updated_Date\":\"2026-08-01T05:18:17.000Z\"}', '[{\"InletProduct_id\":61,\"Challan_id\":6,\"Product_Name\":\"Ring Rod\",\"HSN_Code\":\"121545\",\"Product_Quantity\":15,\"Rate\":1000,\"SubTotal\":15000},{\"InletProduct_id\":62,\"Challan_id\":6,\"Product_Name\":\"Flash light rod\",\"HSN_Code\":\"121150\",\"Product_Quantity\":20,\"Rate\":2000,\"SubTotal\":40000}]');

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
(7, 2, '{\"Customer_Name\": \"New Fourthdm\", \"Company_Name\": \"Fourth_Dimension\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AAA12454599656\", \"Delivery_Address\": \"Kharadi\", \"Sub_Total\": 5000.00, \"Total_Amount\": 5000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 450.00, \"SGST_amount\": 450.00, \"Grand_Total\": 5900.00, \"Mode_of_Transport\": \"Vehicle\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AB 2322\", \"Remark\": \"Goods\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-17 13:04:18\", \"Updated_Date\": \"2026-07-23 16:32:29\"}', '{\"Customer_Name\": \"New Fourthdm\", \"Company_Name\": \"Fourth_Dimension\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AAA12454599656\", \"Delivery_Address\": \"Kharadi\", \"Sub_Total\": 5000.00, \"Total_Amount\": 5000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 450.00, \"SGST_amount\": 450.00, \"Grand_Total\": 5900.00, \"Mode_of_Transport\": \"Vehicle\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AB 2322\", \"Remark\": \"Goods\", \"Work_Status\": \"Completed\", \"Delivery_Status\": \"Delivered\", \"Challan_Status\": \"Close\", \"Added_Date\": \"2026-07-17 13:04:18\", \"Updated_Date\": \"2026-07-23 16:32:29\"}', '2026-07-24 09:49:47'),
(8, 5, '{\"Customer_Name\": \"Amol More\", \"Company_Name\": \"Morya Enterprises\", \"Company_Address\": \"Khandve nagar Kharadi, pune.\", \"GST_No\": \"27AAA345245\", \"Delivery_Address\": \"\", \"Sub_Total\": 50000.00, \"Total_Amount\": 45000.00, \"Discount_Amount\": 5000.00, \"CGST_amount\": 4050.00, \"SGST_amount\": 4050.00, \"Grand_Total\": 53100.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 14 AD 3434\", \"Remark\": \"Goods \", \"Work_Status\": \"In Queue\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-27 11:31:21\", \"Updated_Date\": \"2026-07-27 11:31:21\"}', '{\"Customer_Name\": \"Amol More\", \"Company_Name\": \"Morya Enterprises\", \"Company_Address\": \"Khandve nagar Kharadi, pune.\", \"GST_No\": \"27AAA345245\", \"Delivery_Address\": \"\", \"Sub_Total\": 55000.00, \"Total_Amount\": 55000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 4950.00, \"SGST_amount\": 4950.00, \"Grand_Total\": 64900.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 14 AD 3434\", \"Remark\": \"Goods \", \"Work_Status\": \"Hold\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-27 11:31:21\", \"Updated_Date\": \"2026-07-27 11:31:21\"}', '2026-07-29 11:57:58'),
(9, 5, '{\"Customer_Name\": \"Amol More\", \"Company_Name\": \"Morya Enterprises\", \"Company_Address\": \"Khandve nagar Kharadi, pune.\", \"GST_No\": \"27AAA345245\", \"Delivery_Address\": \"\", \"Sub_Total\": 55000.00, \"Total_Amount\": 55000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 4950.00, \"SGST_amount\": 4950.00, \"Grand_Total\": 64900.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 14 AD 3434\", \"Remark\": \"Goods \", \"Work_Status\": \"Hold\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-27 11:31:21\", \"Updated_Date\": \"2026-07-29 11:57:58\"}', '{\"Customer_Name\": \"Amol More\", \"Company_Name\": \"Morya Enterprises\", \"Company_Address\": \"Khandve nagar Kharadi, pune.\", \"GST_No\": \"27AAA345245\", \"Delivery_Address\": \"\", \"Sub_Total\": 40000.00, \"Total_Amount\": 40000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 3600.00, \"SGST_amount\": 3600.00, \"Grand_Total\": 47200.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 14 AD 3434\", \"Remark\": \"Goods \", \"Work_Status\": \"Hold\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-27 11:31:21\", \"Updated_Date\": \"2026-07-29 11:57:58\"}', '2026-07-29 12:04:25'),
(10, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 20500.00, \"Total_Amount\": 20500.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 1845.00, \"SGST_amount\": 1845.00, \"Grand_Total\": 24190.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Hold\", \"Delivery_Status\": \"In Transport\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-23 17:20:11\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 29000.00, \"Total_Amount\": 29000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 2610.00, \"SGST_amount\": 2610.00, \"Grand_Total\": 34220.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-23 17:20:11\"}', '2026-07-29 12:44:40'),
(11, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 29000.00, \"Total_Amount\": 29000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 2610.00, \"SGST_amount\": 2610.00, \"Grand_Total\": 34220.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 12:44:40\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 35000.00, \"Total_Amount\": 35000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 3150.00, \"SGST_amount\": 3150.00, \"Grand_Total\": 41300.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 12:44:40\"}', '2026-07-29 12:56:51'),
(12, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 35000.00, \"Total_Amount\": 35000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 3150.00, \"SGST_amount\": 3150.00, \"Grand_Total\": 41300.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 12:56:51\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 12:56:51\"}', '2026-07-29 14:27:55'),
(13, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 14:27:55\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 14:27:55\"}', '2026-07-29 14:30:07'),
(14, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 14:30:07\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 14:30:07\"}', '2026-07-29 14:33:03'),
(15, 5, '{\"Customer_Name\": \"Amol More\", \"Company_Name\": \"Morya Enterprises\", \"Company_Address\": \"Khandve nagar Kharadi, pune.\", \"GST_No\": \"27AAA345245\", \"Delivery_Address\": \"\", \"Sub_Total\": 40000.00, \"Total_Amount\": 40000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 3600.00, \"SGST_amount\": 3600.00, \"Grand_Total\": 47200.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 14 AD 3434\", \"Remark\": \"Goods \", \"Work_Status\": \"Hold\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-27 11:31:21\", \"Updated_Date\": \"2026-07-29 12:04:25\"}', '{\"Customer_Name\": \"Amol More\", \"Company_Name\": \"Morya Enterprises\", \"Company_Address\": \"Khandve nagar Kharadi, pune.\", \"GST_No\": \"27AAA345245\", \"Delivery_Address\": \"\", \"Sub_Total\": 140000.00, \"Total_Amount\": 140000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 12600.00, \"SGST_amount\": 12600.00, \"Grand_Total\": 165200.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 14 AD 3434\", \"Remark\": \"Goods \", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-27 11:31:21\", \"Updated_Date\": \"2026-07-29 12:04:25\"}', '2026-07-29 14:34:57'),
(16, 5, '{\"Customer_Name\": \"Amol More\", \"Company_Name\": \"Morya Enterprises\", \"Company_Address\": \"Khandve nagar Kharadi, pune.\", \"GST_No\": \"27AAA345245\", \"Delivery_Address\": \"\", \"Sub_Total\": 140000.00, \"Total_Amount\": 140000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 12600.00, \"SGST_amount\": 12600.00, \"Grand_Total\": 165200.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 14 AD 3434\", \"Remark\": \"Goods \", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-27 11:31:21\", \"Updated_Date\": \"2026-07-29 14:34:57\"}', '{\"Customer_Name\": \"Amol More\", \"Company_Name\": \"Morya Enterprises\", \"Company_Address\": \"Khandve nagar Kharadi, pune.\", \"GST_No\": \"27AAA345245\", \"Delivery_Address\": \"Pune\", \"Sub_Total\": 90000.00, \"Total_Amount\": 90000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 8100.00, \"SGST_amount\": 8100.00, \"Grand_Total\": 106200.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 14 AD 3434\", \"Remark\": \"Goods \", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-07-27 11:31:21\", \"Updated_Date\": \"2026-07-29 14:34:57\"}', '2026-07-29 14:50:22'),
(17, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 14:33:03\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 65000.00, \"Total_Amount\": 65000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 5850.00, \"SGST_amount\": 5850.00, \"Grand_Total\": 76700.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 14:33:03\"}', '2026-07-29 14:51:31'),
(18, 4, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 65000.00, \"Total_Amount\": 65000.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 5850.00, \"SGST_amount\": 5850.00, \"Grand_Total\": 76700.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 14:51:31\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Kharadi,Pune\", \"Sub_Total\": 117500.00, \"Total_Amount\": 117500.00, \"Discount_Amount\": 0.00, \"CGST_amount\": 10575.00, \"SGST_amount\": 10575.00, \"Grand_Total\": 138650.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"New Demo\", \"Vehicle_Number\": \"MH 12 AD 8818\", \"Remark\": \"Normal\", \"Work_Status\": \"Processing\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-07-23 12:51:26\", \"Updated_Date\": \"2026-07-29 14:51:31\"}', '2026-07-29 15:56:30'),
(19, 9, '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Pune\", \"Sub_Total\": 85000.00, \"Total_Amount\": 80000.00, \"Discount_Amount\": 5000.00, \"CGST_amount\": 7200.00, \"SGST_amount\": 7200.00, \"Grand_Total\": 94400.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo \", \"Vehicle_Number\": \"MH 44 AB 1212\", \"Remark\": \"Goods\", \"Work_Status\": \"In Queue\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-08-03 16:37:23\", \"Updated_Date\": \"2026-08-03 16:37:23\"}', '{\"Customer_Name\": \"Manisha Kulkarni\", \"Company_Name\": \"New Fourthdm\", \"Company_Address\": \"Pune\", \"GST_No\": \"27AA5685874352\", \"Delivery_Address\": \"Pune\", \"Sub_Total\": 85000.00, \"Total_Amount\": 80000.00, \"Discount_Amount\": 5000.00, \"CGST_amount\": 7200.00, \"SGST_amount\": 7200.00, \"Grand_Total\": 94400.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo \", \"Vehicle_Number\": \"MH 44 AB 1212\", \"Remark\": \"Goods\", \"Work_Status\": \"Breakdown\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-08-03 16:37:23\", \"Updated_Date\": \"2026-08-03 16:37:23\"}', '2026-08-03 18:23:02');

-- --------------------------------------------------------

--
-- Table structure for table `inletproducts`
--

CREATE TABLE `inletproducts` (
  `InletProduct_id` int(11) NOT NULL,
  `Challan_id` int(11) NOT NULL,
  `SalesOrderItem_id` int(11) DEFAULT NULL,
  `Product_id` int(11) DEFAULT NULL,
  `Product_Name` varchar(255) NOT NULL,
  `HSN_Code` varchar(100) NOT NULL,
  `Product_Quantity` int(11) NOT NULL,
  `Ordered_Quantity` int(11) NOT NULL DEFAULT 0,
  `Produced_Quantity` int(11) NOT NULL DEFAULT 0,
  `Damaged_Quantity` int(11) NOT NULL DEFAULT 0,
  `Faulty_Quantity` int(11) NOT NULL DEFAULT 0,
  `Good_Quantity` int(11) NOT NULL DEFAULT 0,
  `Extra_Quantity` int(11) NOT NULL DEFAULT 0,
  `Rate` decimal(10,2) NOT NULL,
  `SubTotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inletproducts`
--

INSERT INTO `inletproducts` (`InletProduct_id`, `Challan_id`, `SalesOrderItem_id`, `Product_id`, `Product_Name`, `HSN_Code`, `Product_Quantity`, `Ordered_Quantity`, `Produced_Quantity`, `Damaged_Quantity`, `Faulty_Quantity`, `Good_Quantity`, `Extra_Quantity`, `Rate`, `SubTotal`) VALUES
(10, 3, NULL, NULL, 'Cutter', '134512', 25, 0, 0, 0, 0, 0, 0, 1000.00, 25000.00),
(11, 3, NULL, NULL, 'Sheet', '112548', 10, 0, 0, 0, 0, 0, 0, 1000.00, 10000.00),
(63, 7, NULL, NULL, 'Glass', '1215515', 20, 0, 0, 0, 0, 0, 0, 1200.00, 24000.00),
(64, 8, NULL, NULL, 'Rings', '121520', 30, 0, 0, 0, 0, 0, 0, 1000.00, 30000.00),
(65, 9, NULL, NULL, 'Rings ', '112515', 50, 0, 0, 0, 0, 0, 0, 1500.00, 75000.00),
(66, 9, NULL, NULL, 'Mill', '114125', 10, 0, 0, 0, 0, 0, 0, 1000.00, 10000.00),
(67, 10, NULL, NULL, 'End Mills', '1121542', 50, 0, 0, 0, 0, 0, 0, 1500.00, 75000.00),
(68, 11, NULL, NULL, 'Mill', '9324', 25, 0, 0, 0, 0, 0, 0, 1000.00, 25000.00),
(69, 11, NULL, NULL, 'Drills', '21255', 50, 0, 0, 0, 0, 0, 0, 1498.00, 74900.00);

--
-- Triggers `inletproducts`
--
DELIMITER $$
CREATE TRIGGER `trg_inletproducts_history` AFTER UPDATE ON `inletproducts` FOR EACH ROW BEGIN

INSERT INTO inletproducts_history
(
    Challan_id,
    InletProduct_id,
    old_product,
    new_product
)

VALUES
(
    OLD.Challan_id,
    OLD.InletProduct_id,

    JSON_OBJECT(
        'Challan_id',OLD.Challan_id,
        'Product_Name',OLD.Product_Name,
        'HSN_Code',OLD.HSN_Code,
        'Product_Quantity',OLD.Product_Quantity,
        'Rate',OLD.Rate,
        'SubTotal',OLD.SubTotal      
    ),

    JSON_OBJECT(
        'Challan_id',NEW.Challan_id,
        'Product_Name',NEW.Product_Name,
        'HSN_Code',NEW.HSN_Code,
        'Product_Quantity',NEW.Product_Quantity,
        'Rate',NEW.Rate,
        'SubTotal',NEW.SubTotal
    )
);

END
$$
DELIMITER ;

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

--
-- Dumping data for table `inletproducts_history`
--

INSERT INTO `inletproducts_history` (`History_Id`, `Challan_id`, `InletProduct_id`, `old_product`, `new_product`, `Updated_Date`) VALUES
(1, 4, 47, '{\"Challan_id\": 4, \"Product_Name\": \"Drill\", \"HSN_Code\": \"114515\", \"Product_Quantity\": 1, \"Rate\": 1500.00, \"SubTotal\": 1500.00}', '{\"Challan_id\": 4, \"Product_Name\": \"Drill\", \"HSN_Code\": \"114515\", \"Product_Quantity\": 2, \"Rate\": 1500.00, \"SubTotal\": 1500.00}', '2026-07-29 12:53:47'),
(2, 4, 48, '{\"Product_Name\": \"Mills\", \"HSN_Code\": \"1542145\", \"Product_Quantity\": 15, \"Rate\": 1500.00, \"SubTotal\": 22500.00}', NULL, '2026-07-29 14:33:03'),
(3, 4, 49, '{\"Product_Name\": \"Cutters\", \"HSN_Code\": \"14515\", \"Product_Quantity\": 25, \"Rate\": 200.00, \"SubTotal\": 5000.00}', NULL, '2026-07-29 14:33:03'),
(4, 4, 50, '{\"Product_Name\": \"Drill\", \"HSN_Code\": \"114515\", \"Product_Quantity\": 5, \"Rate\": 1500.00, \"SubTotal\": 7500.00}', NULL, '2026-07-29 14:33:03'),
(5, 5, 43, '{\"Product_Name\": \"Mill\", \"HSN_Code\": \"111215\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '{\"Product_Name\": \"Mill\", \"HSN_Code\": \"111215\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '2026-07-29 14:34:57'),
(6, 5, 44, '{\"Product_Name\": \"Cutter\", \"HSN_Code\": \"115145\", \"Product_Quantity\": 15, \"Rate\": 2000.00, \"SubTotal\": 30000.00}', '{\"Product_Name\": \"Cutter\", \"HSN_Code\": \"115145\", \"Product_Quantity\": 15, \"Rate\": 2000.00, \"SubTotal\": 30000.00}', '2026-07-29 14:34:57'),
(8, 5, 54, '{\"Product_Name\": \"Mills\", \"HSN_Code\": \"111215\", \"Product_Quantity\": 100, \"Rate\": 1000.00, \"SubTotal\": 100000.00}', NULL, '2026-07-29 14:50:22'),
(9, 5, 55, '{\"Product_Name\": \"Cutters\", \"HSN_Code\": \"115145\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', NULL, '2026-07-29 14:50:22'),
(11, 5, 56, NULL, '{\"Product_Name\": \"Mills\", \"HSN_Code\": \"111215\", \"Product_Quantity\": 100, \"Rate\": 500.00, \"SubTotal\": 50000.00}', '2026-07-29 14:50:22'),
(12, 5, 57, NULL, '{\"Product_Name\": \"Cutters\", \"HSN_Code\": \"115145\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', '2026-07-29 14:50:22'),
(14, 4, 51, '{\"Product_Name\": \"Mills\", \"HSN_Code\": \"1542145\", \"Product_Quantity\": 20, \"Rate\": 1500.00, \"SubTotal\": 30000.00}', NULL, '2026-07-29 14:51:31'),
(15, 4, 52, '{\"Product_Name\": \"Cutters\", \"HSN_Code\": \"14515\", \"Product_Quantity\": 25, \"Rate\": 200.00, \"SubTotal\": 5000.00}', NULL, '2026-07-29 14:51:31'),
(16, 4, 53, '{\"Product_Name\": \"Drill\", \"HSN_Code\": \"114515\", \"Product_Quantity\": 10, \"Rate\": 1500.00, \"SubTotal\": 15000.00}', NULL, '2026-07-29 14:51:31'),
(17, 4, 58, NULL, '{\"Product_Name\": \"Mills\", \"HSN_Code\": \"1542145\", \"Product_Quantity\": 25, \"Rate\": 1500.00, \"SubTotal\": 37500.00}', '2026-07-29 14:51:31'),
(18, 4, 59, NULL, '{\"Product_Name\": \"Cutters\", \"HSN_Code\": \"14515\", \"Product_Quantity\": 25, \"Rate\": 200.00, \"SubTotal\": 5000.00}', '2026-07-29 14:51:31'),
(19, 4, 60, NULL, '{\"Product_Name\": \"Drill\", \"HSN_Code\": \"114515\", \"Product_Quantity\": 15, \"Rate\": 1500.00, \"SubTotal\": 22500.00}', '2026-07-29 14:51:31'),
(20, 4, 58, '{\"Challan_id\": 4, \"Product_Name\": \"Mills\", \"HSN_Code\": \"1542145\", \"Product_Quantity\": 25, \"Rate\": 1500.00, \"SubTotal\": 37500.00}', '{\"Challan_id\": 4, \"Product_Name\": \"Mills\", \"HSN_Code\": \"1542145\", \"Product_Quantity\": 25, \"Rate\": 1500.00, \"SubTotal\": 37500.00}', '2026-07-29 15:56:30'),
(21, 4, 59, '{\"Challan_id\": 4, \"Product_Name\": \"Cutters\", \"HSN_Code\": \"14515\", \"Product_Quantity\": 25, \"Rate\": 200.00, \"SubTotal\": 5000.00}', '{\"Challan_id\": 4, \"Product_Name\": \"Cutter\", \"HSN_Code\": \"14515\", \"Product_Quantity\": 25, \"Rate\": 2000.00, \"SubTotal\": 50000.00}', '2026-07-29 15:56:30'),
(22, 4, 60, '{\"Challan_id\": 4, \"Product_Name\": \"Drill\", \"HSN_Code\": \"114515\", \"Product_Quantity\": 15, \"Rate\": 1500.00, \"SubTotal\": 22500.00}', '{\"Challan_id\": 4, \"Product_Name\": \"Drills\", \"HSN_Code\": \"1100012\", \"Product_Quantity\": 20, \"Rate\": 1500.00, \"SubTotal\": 30000.00}', '2026-07-29 15:56:30'),
(23, 9, 65, '{\"Challan_id\": 9, \"Product_Name\": \"Rings \", \"HSN_Code\": \"112515\", \"Product_Quantity\": 50, \"Rate\": 1500.00, \"SubTotal\": 75000.00}', '{\"Challan_id\": 9, \"Product_Name\": \"Rings \", \"HSN_Code\": \"112515\", \"Product_Quantity\": 50, \"Rate\": 1500.00, \"SubTotal\": 75000.00}', '2026-08-03 18:23:02'),
(24, 9, 66, '{\"Challan_id\": 9, \"Product_Name\": \"Mill\", \"HSN_Code\": \"114125\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '{\"Challan_id\": 9, \"Product_Name\": \"Mill\", \"HSN_Code\": \"114125\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '2026-08-03 18:23:02');

-- --------------------------------------------------------

--
-- Table structure for table `operations_history`
--

CREATE TABLE `operations_history` (
  `History_Id` int(11) NOT NULL,
  `Operation_id` int(11) NOT NULL,
  `VendorProduct_id` int(11) DEFAULT NULL,
  `old_operation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_operation`)),
  `new_operation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_operation`)),
  `Updated_Date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `operations_history`
--

INSERT INTO `operations_history` (`History_Id`, `Operation_id`, `VendorProduct_id`, `old_operation`, `new_operation`, `Updated_Date`) VALUES
(1, 24, 19, '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Cuttings\", \"Rate\": 500.00}', '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Cuttings\", \"Rate\": 50.00}', '2026-08-06 17:46:20'),
(2, 25, 19, '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Shinnings\", \"Rate\": 500.00}', '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Shinnings\", \"Rate\": 50.00}', '2026-08-06 17:46:20'),
(3, 26, 19, '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Sharping\", \"Rate\": 1000.00}', '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Sharping\", \"Rate\": 100.00}', '2026-08-06 17:46:20'),
(4, 27, 20, '{\"VendorProduct_id\": 20, \"Operation_Name\": \"Cuttings \", \"Rate\": 1000.00}', '{\"VendorProduct_id\": 20, \"Operation_Name\": \"Cuttings \", \"Rate\": 1000.00}', '2026-08-06 17:46:20'),
(5, 24, 19, '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Cuttings\", \"Rate\": 50.00}', '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Cuttings\", \"Rate\": 20.00}', '2026-08-06 17:47:27'),
(6, 25, 19, '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Shinnings\", \"Rate\": 50.00}', '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Shinnings\", \"Rate\": 50.00}', '2026-08-06 17:47:27'),
(7, 26, 19, '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Sharping\", \"Rate\": 100.00}', '{\"VendorProduct_id\": 19, \"Operation_Name\": \"Sharping\", \"Rate\": 100.00}', '2026-08-06 17:47:27'),
(8, 27, 20, '{\"VendorProduct_id\": 20, \"Operation_Name\": \"Cuttings \", \"Rate\": 1000.00}', '{\"VendorProduct_id\": 20, \"Operation_Name\": \"Cuttings \", \"Rate\": 1000.00}', '2026-08-06 17:47:27');

-- --------------------------------------------------------

--
-- Table structure for table `product_excess_stock`
--

CREATE TABLE `product_excess_stock` (
  `ExcessStock_id` int(11) NOT NULL,
  `Product_id` int(11) DEFAULT NULL,
  `Product_Name` varchar(255) NOT NULL,
  `HSN_Code` varchar(100) DEFAULT NULL,
  `Available_Quantity` int(11) NOT NULL DEFAULT 0,
  `Updated_Date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_excess_stock_history`
--

CREATE TABLE `product_excess_stock_history` (
  `History_id` int(11) NOT NULL,
  `Product_id` int(11) DEFAULT NULL,
  `Product_Name` varchar(255) NOT NULL,
  `Sales_Order_Number` varchar(100) DEFAULT NULL,
  `Transaction_Type` varchar(50) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `Reference_InletProduct_id` int(11) DEFAULT NULL,
  `Remark` varchar(500) DEFAULT NULL,
  `Added_Date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesorder`
--

CREATE TABLE `salesorder` (
  `SalesOrder_id` int(11) NOT NULL,
  `Sales_Order_Number` varchar(100) NOT NULL,
  `Customer_Name` varchar(255) NOT NULL,
  `Company_Name` varchar(255) NOT NULL,
  `Company_Address` varchar(255) NOT NULL,
  `GST_No` varchar(255) NOT NULL,
  `Delivery_Address` varchar(255) NOT NULL,
  `Sub_Total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `Discount_Amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `Total_Amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `CGST_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `SGST_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `Grand_Total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `Remark` text DEFAULT NULL,
  `Sales_Order_Status` varchar(100) NOT NULL DEFAULT 'Draft',
  `Added_Date` timestamp NOT NULL DEFAULT current_timestamp(),
  `Updated_Date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesorder`
--

INSERT INTO `salesorder` (`SalesOrder_id`, `Sales_Order_Number`, `Customer_Name`, `Company_Name`, `Company_Address`, `GST_No`, `Delivery_Address`, `Sub_Total`, `Discount_Amount`, `Total_Amount`, `CGST_amount`, `SGST_amount`, `Grand_Total`, `Remark`, `Sales_Order_Status`, `Added_Date`, `Updated_Date`) VALUES
(3, 'SO_202609_03', 'Shubham Navle', 'Shubham Industries', 'Pimpri Chinchvad.', '27AAA2455463', 'Pimpri.', 75000.00, 70000.00, 5000.00, 6300.00, 6300.00, 82600.00, 'Sales Order Generated', 'Generate', '2026-09-24 06:36:10', '2026-09-24 06:36:39');

-- --------------------------------------------------------

--
-- Table structure for table `salesorderitems`
--

CREATE TABLE `salesorderitems` (
  `SalesOrderItem_id` int(11) NOT NULL,
  `SalesOrder_id` int(11) NOT NULL,
  `Product_Name` varchar(255) NOT NULL,
  `HSN_Code` varchar(100) NOT NULL,
  `Ordered_Quantity` int(11) NOT NULL DEFAULT 0,
  `Rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `SubTotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `Added_Date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesorderitems`
--

INSERT INTO `salesorderitems` (`SalesOrderItem_id`, `SalesOrder_id`, `Product_Name`, `HSN_Code`, `Ordered_Quantity`, `Rate`, `SubTotal`, `Added_Date`) VALUES
(3, 3, 'Rings', '115415', 50, 100.00, 5000.00, '2026-09-24 06:36:10'),
(4, 3, 'Rods', '111152', 70, 1000.00, 70000.00, '2026-09-24 06:36:10');

-- --------------------------------------------------------

--
-- Table structure for table `salesorder_deletion_history`
--

CREATE TABLE `salesorder_deletion_history` (
  `SalesorderDeleted_id` int(11) NOT NULL,
  `SalesOrder_id` int(11) NOT NULL,
  `Sales_Order_Number` varchar(100) DEFAULT NULL,
  `Deleted_By_Admin_id` int(11) NOT NULL,
  `Deleted_By_Admin_Name` varchar(255) DEFAULT NULL,
  `Deletion_Reason` text NOT NULL,
  `Deleted_Date` datetime DEFAULT current_timestamp(),
  `SalesOrder_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`SalesOrder_Data`)),
  `SalesOrderProduct_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`SalesOrderProduct_Data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesorder_deletion_history`
--

INSERT INTO `salesorder_deletion_history` (`SalesorderDeleted_id`, `SalesOrder_id`, `Sales_Order_Number`, `Deleted_By_Admin_id`, `Deleted_By_Admin_Name`, `Deletion_Reason`, `Deleted_Date`, `SalesOrder_Data`, `SalesOrderProduct_Data`) VALUES
(1, 2, 'SO_202609_02', 1, 'Vikas Tiwaskar', 'Functionality check', '2026-09-24 16:09:27', '{\"SalesOrder_id\":2,\"Sales_Order_Number\":\"SO_202609_02\",\"Customer_Name\":\"Varsha Mane\",\"Company_Name\":\"Varsha Industry\",\"Company_Address\":\"Sangali\",\"GST_No\":\"28AADD11125452213\",\"Delivery_Address\":\"Pune\",\"Sub_Total\":150000,\"Discount_Amount\":140000,\"Total_Amount\":10000,\"CGST_amount\":12600,\"SGST_amount\":12600,\"Grand_Total\":165200,\"Remark\":\"SalesOrder Created.\",\"Sales_Order_Status\":\"Generate\",\"Added_Date\":\"2026-09-11T10:08:08.000Z\",\"Updated_Date\":\"2026-09-24T06:22:11.000Z\"}', '[{\"SalesOrderItem_id\":1,\"SalesOrder_id\":2,\"Product_Name\":\"End Mill\",\"HSN_Code\":\"112125\",\"Ordered_Quantity\":50,\"Rate\":1500,\"SubTotal\":75000,\"Added_Date\":\"2026-09-11T10:08:08.000Z\"},{\"SalesOrderItem_id\":2,\"SalesOrder_id\":2,\"Product_Name\":\"Drills\",\"HSN_Code\":\"221512\",\"Ordered_Quantity\":50,\"Rate\":1500,\"SubTotal\":75000,\"Added_Date\":\"2026-09-11T10:08:08.000Z\"}]');

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
(11, 'VC_20260804_01', 'Mindscrafts', 'Mindscrafts Solution Pvt Ltd.', 'Pune', '27AAD453635363', '8965451245', 'mind@gmail.com', 15000.00, 15000.00, 1350.00, 1350.00, 17700.00, 'Sea/Maritime Transport', 'Demo ', 'MH 23 AB 4424', 'Gooods', 'Not Received', 'Not Delivered', 'Open', '2026-08-04 06:20:03', '2026-08-04 06:20:03'),
(12, 'VC_20260804_02', 'Mindscrafts', 'Mindscrafts Solution Pvt Ltd.', 'Pune', '27AAD453635363', '8965451245', 'mind@gmail.com', 15000.00, 15000.00, 1350.00, 1350.00, 17700.00, 'Sea/Maritime Transport', 'Demo ', 'MH 23 AB 4424', 'Gooods', 'Not Received', 'Not Delivered', 'Open', '2026-08-04 06:20:04', '2026-08-04 06:20:04'),
(13, 'VC_20260804_03', 'Mindscrafts', 'Mindscrafts Solution Pvt Ltd.', 'Pune', '27AAD453635363', '8965451245', 'mind@gmail.com', 25000.00, 25000.00, 2250.00, 2250.00, 29500.00, 'Road Transport', '', '', '', 'Not Received', 'Not Delivered', 'Open', '2026-08-04 06:21:29', '2026-08-04 06:21:29'),
(16, 'VC_202609_01', 'Shridhar ', 'New ', 'Pune', '27AAA4347358', '9856235689', 'shridhar@gmail.com', 27500.00, 27500.00, 2475.00, 2475.00, 32450.00, '', '', '', '', 'Not Received', 'Delivered', 'Open', '2026-09-10 09:19:04', '2026-09-10 09:19:04');

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
-- Table structure for table `vendorchallan_deletion_history`
--

CREATE TABLE `vendorchallan_deletion_history` (
  `DeletionHistory_id` int(11) NOT NULL,
  `VendorChallan_id` int(11) NOT NULL,
  `VendorChallan_Code` varchar(100) DEFAULT NULL,
  `Deleted_By_Admin_id` int(11) NOT NULL,
  `Deleted_By_Admin_Name` varchar(255) DEFAULT NULL,
  `Deletion_Reason` text NOT NULL,
  `Deleted_Date` datetime DEFAULT current_timestamp(),
  `Challan_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Challan_Data`)),
  `Product_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Product_Data`)),
  `Operation_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Operation_Data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendorchallan_deletion_history`
--

INSERT INTO `vendorchallan_deletion_history` (`DeletionHistory_id`, `VendorChallan_id`, `VendorChallan_Code`, `Deleted_By_Admin_id`, `Deleted_By_Admin_Name`, `Deletion_Reason`, `Deleted_Date`, `Challan_Data`, `Product_Data`, `Operation_Data`) VALUES
(1, 7, 'VC_20260803_02', 1, 'Vikas Tiwaskar', 'Vendor is not present now.', '2026-09-02 16:25:47', '{\"VendorChallan_id\":7,\"VendorChallan_Code\":\"VC_20260803_02\",\"Vendor_Name\":\"Mindscrafts\",\"Vendor_CompanyName\":\"Mindscrafts Solution Pvt Ltd.\",\"Vendor_CompanyAddress\":\"Pune\",\"VendorGST_No\":\"27AAD453635363\",\"Vendor_Phoneno\":\"8965451245\",\"Vendor_Email\":\"mind@gmail.com\",\"Sub_Total\":37500,\"Total_Amount\":37500,\"CGST_amount\":3375,\"SGST_amount\":3375,\"Grand_Total\":44250,\"Mode_of_Transport\":\"Road Transport\",\"Transporter_Name\":\"Demo\",\"Vehicle_Number\":\"MH 12 HK 4523\",\"Remark\":\"Good\",\"Product_Status\":\"Not Received\",\"Delivery_Status\":\"Dispatched\",\"Challan_Status\":\"Open\",\"Added_Date\":\"2026-08-03T12:47:34.000Z\",\"Updated_Date\":\"2026-08-03T12:47:34.000Z\"}', '[{\"VendorProduct_id\":10,\"VendorChallan_id\":7,\"Product_Name\":\"Glass\",\"HSN_Code\":\"111512\",\"Product_Quantity\":25,\"Rate\":1500,\"SubTotal\":37500}]', NULL),
(2, 8, 'VC_20260803_03', 1, 'Vikas Tiwaskar', 'Vendor is not present', '2026-09-02 18:15:41', '{\"VendorChallan_id\":8,\"VendorChallan_Code\":\"VC_20260803_03\",\"Vendor_Name\":\"Mindscrafts\",\"Vendor_CompanyName\":\"Mindscrafts Solution Pvt Ltd.\",\"Vendor_CompanyAddress\":\"Pune\",\"VendorGST_No\":\"27AAD453635363\",\"Vendor_Phoneno\":\"8965451245\",\"Vendor_Email\":\"mind@gmail.com\",\"Sub_Total\":37500,\"Total_Amount\":37500,\"CGST_amount\":3375,\"SGST_amount\":3375,\"Grand_Total\":44250,\"Mode_of_Transport\":\"Road Transport\",\"Transporter_Name\":\"Demo\",\"Vehicle_Number\":\"MH 12 HK 4523\",\"Remark\":\"Good\",\"Product_Status\":\"Not Received\",\"Delivery_Status\":\"Dispatched\",\"Challan_Status\":\"Open\",\"Added_Date\":\"2026-08-03T12:47:35.000Z\",\"Updated_Date\":\"2026-08-03T12:47:35.000Z\"}', '[{\"VendorProduct_id\":11,\"VendorChallan_id\":8,\"Product_Name\":\"Glass\",\"HSN_Code\":\"111512\",\"Product_Quantity\":25,\"Rate\":1500,\"SubTotal\":37500}]', NULL),
(3, 9, 'VC_20260803_04', 1, 'Vikas Tiwaskar', 'Vendor not active.', '2026-09-02 18:16:33', '{\"VendorChallan_id\":9,\"VendorChallan_Code\":\"VC_20260803_04\",\"Vendor_Name\":\"Mindscrafts\",\"Vendor_CompanyName\":\"Mindscrafts Solution Pvt Ltd.\",\"Vendor_CompanyAddress\":\"Pune\",\"VendorGST_No\":\"27AAD453635363\",\"Vendor_Phoneno\":\"8965451245\",\"Vendor_Email\":\"mind@gmail.com\",\"Sub_Total\":37500,\"Total_Amount\":37500,\"CGST_amount\":3375,\"SGST_amount\":3375,\"Grand_Total\":44250,\"Mode_of_Transport\":\"Road Transport\",\"Transporter_Name\":\"Demo\",\"Vehicle_Number\":\"MH 12 HK 4523\",\"Remark\":\"Good\",\"Product_Status\":\"Not Received\",\"Delivery_Status\":\"Dispatched\",\"Challan_Status\":\"Open\",\"Added_Date\":\"2026-08-03T12:49:43.000Z\",\"Updated_Date\":\"2026-08-03T12:49:43.000Z\"}', '[{\"VendorProduct_id\":12,\"VendorChallan_id\":9,\"Product_Name\":\"Glass\",\"HSN_Code\":\"111512\",\"Product_Quantity\":25,\"Rate\":1500,\"SubTotal\":37500}]', NULL),
(4, 15, 'VC_20260804_05', 1, 'Vikas Tiwaskar', 'The order is cancelled.', '2026-09-08 12:20:29', '{\"VendorChallan_id\":15,\"VendorChallan_Code\":\"VC_20260804_05\",\"Vendor_Name\":\"Shridhar \",\"Vendor_CompanyName\":\"New \",\"Vendor_CompanyAddress\":\"Pune\",\"VendorGST_No\":\"27AAA4347358\",\"Vendor_Phoneno\":\"9856235689\",\"Vendor_Email\":\"shridhar@gmail.com\",\"Sub_Total\":13400,\"Total_Amount\":13400,\"CGST_amount\":1206,\"SGST_amount\":1206,\"Grand_Total\":15812,\"Mode_of_Transport\":\"Road Transport\",\"Transporter_Name\":\"Demo\",\"Vehicle_Number\":\"MH 12 AA 4423\",\"Remark\":\"Goods\",\"Product_Status\":\"Not Received\",\"Delivery_Status\":\"Dispatched\",\"Challan_Status\":\"Not Close\",\"Added_Date\":\"2026-08-04T10:01:58.000Z\",\"Updated_Date\":\"2026-08-06T12:17:27.000Z\"}', '[{\"VendorProduct_id\":19,\"VendorChallan_id\":15,\"Product_Name\":\"Rod\",\"HSN_Code\":\"112155\",\"Product_Quantity\":20,\"Rate\":170,\"SubTotal\":3400},{\"VendorProduct_id\":20,\"VendorChallan_id\":15,\"Product_Name\":\"End Mills\",\"HSN_Code\":\"111000\",\"Product_Quantity\":10,\"Rate\":1000,\"SubTotal\":10000}]', NULL),
(5, 10, 'VC_20260803_05', 7, 'Manisha Kulkarni', 'Product', '2026-09-10 13:03:44', '{\"VendorChallan_id\":10,\"VendorChallan_Code\":\"VC_20260803_05\",\"Vendor_Name\":\"Mindscrafts\",\"Vendor_CompanyName\":\"Mindscrafts Solution Pvt Ltd.\",\"Vendor_CompanyAddress\":\"Pune\",\"VendorGST_No\":\"27AAD453635363\",\"Vendor_Phoneno\":\"8965451245\",\"Vendor_Email\":\"mind@gmail.com\",\"Sub_Total\":37500,\"Total_Amount\":37500,\"CGST_amount\":3375,\"SGST_amount\":3375,\"Grand_Total\":44250,\"Mode_of_Transport\":\"Road Transport\",\"Transporter_Name\":\"Demo\",\"Vehicle_Number\":\"MH 12 HK 4523\",\"Remark\":\"Good\",\"Product_Status\":\"Not Received\",\"Delivery_Status\":\"Dispatched\",\"Challan_Status\":\"Open\",\"Added_Date\":\"2026-08-03T12:49:44.000Z\",\"Updated_Date\":\"2026-08-03T12:49:44.000Z\"}', '[{\"VendorProduct_id\":13,\"VendorChallan_id\":10,\"Product_Name\":\"Glass\",\"HSN_Code\":\"111512\",\"Product_Quantity\":25,\"Rate\":1500,\"SubTotal\":37500}]', NULL);

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
(2, 3, '{\"VendorChallan_Code\": \"VC_20260722_03\", \"Vendor_Name\": \"Mindscrafts\", \"Vendor_CompanyName\": \"Mindscrafts Solution Pvt Ltd.\", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAD453635363\", \"Vendor_Phoneno\": \"8965451245\", \"Vendor_Email\": \"mind@gmail.com\", \"Sub_Total\": 1000.00, \"Total_Amount\": 1000.00, \"CGST_amount\": 90.00, \"SGST_amount\": 90.00, \"Grand_Total\": 1180.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AK 2223\", \"Remark\": \"Good\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Delivered\", \"Challan_Status\": \"Close\", \"Added_Date\": \"2026-07-22 14:37:04\", \"Updated_Date\": \"2026-07-24 09:55:25\"}', '{\"VendorChallan_Code\": \"VC_20260722_03\", \"Vendor_Name\": \"Mindscrafts\", \"Vendor_CompanyName\": \"Mindscrafts Solution Pvt Ltd.\", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAD453635363\", \"Vendor_Phoneno\": \"8965451245\", \"Vendor_Email\": \"mind@gmail.com\", \"Sub_Total\": 1000.00, \"Total_Amount\": 1000.00, \"CGST_amount\": 90.00, \"SGST_amount\": 90.00, \"Grand_Total\": 1180.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AK 2223\", \"Remark\": \"Good\", \"Product_Status\": \"Received\", \"Delivery_Status\": \"Delivered\", \"Challan_Status\": \"Close\", \"Added_Date\": \"2026-07-22 14:37:04\", \"Updated_Date\": \"2026-07-24 10:00:29\"}', '2026-07-24 10:00:29'),
(3, 5, '{\"VendorChallan_Code\": \"VC_20260727_01\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 20000.00, \"Total_Amount\": 20000.00, \"CGST_amount\": 1800.00, \"SGST_amount\": 1800.00, \"Grand_Total\": 23600.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 14 AD 2356\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-07-27 11:39:50\", \"Updated_Date\": \"2026-07-27 11:39:50\"}', '{\"VendorChallan_Code\": \"VC_20260727_01\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 25000.00, \"Total_Amount\": 25000.00, \"CGST_amount\": 2250.00, \"SGST_amount\": 2250.00, \"Grand_Total\": 29500.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 14 AD 2356\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-07-27 11:39:50\", \"Updated_Date\": \"2026-07-30 11:40:59\"}', '2026-07-30 11:40:59'),
(11, 15, '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-04 15:31:58\"}', '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-05 17:01:59\"}', '2026-08-05 17:01:59'),
(12, 15, '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-05 17:01:59\"}', '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-05 17:03:33\"}', '2026-08-05 17:03:33'),
(13, 14, '{\"VendorChallan_Code\": \"VC_20260804_04\", \"Vendor_Name\": \"New\", \"Vendor_CompanyName\": \"Fourth Dimension\", \"Vendor_CompanyAddress\": \"Kharadi,Pune.\", \"VendorGST_No\": \"27AAA5647372\", \"Vendor_Phoneno\": \"9864578451\", \"Vendor_Email\": \"new@gmail.com\", \"Sub_Total\": 8000.00, \"Total_Amount\": 8000.00, \"CGST_amount\": 720.00, \"SGST_amount\": 720.00, \"Grand_Total\": 9440.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo \", \"Vehicle_Number\": \"MH 12 GK 4545\", \"Remark\": \"Done\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-08-04 15:09:58\", \"Updated_Date\": \"2026-08-04 15:09:58\"}', '{\"VendorChallan_Code\": \"VC_20260804_04\", \"Vendor_Name\": \"New\", \"Vendor_CompanyName\": \"Fourth Dimension\", \"Vendor_CompanyAddress\": \"Kharadi,Pune.\", \"VendorGST_No\": \"27AAA5647372\", \"Vendor_Phoneno\": \"9864578451\", \"Vendor_Email\": \"new@gmail.com\", \"Sub_Total\": 8000.00, \"Total_Amount\": 8000.00, \"CGST_amount\": 720.00, \"SGST_amount\": 720.00, \"Grand_Total\": 9440.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo \", \"Vehicle_Number\": \"MH 12 GK 4545\", \"Remark\": \"Done\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Not Delivered\", \"Challan_Status\": \"Open\", \"Added_Date\": \"2026-08-04 15:09:58\", \"Updated_Date\": \"2026-08-05 17:40:40\"}', '2026-08-05 17:40:40'),
(14, 15, '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-05 17:03:33\"}', '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-06 16:40:38\"}', '2026-08-06 16:40:38'),
(15, 15, '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-06 16:40:38\"}', '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-06 16:51:01\"}', '2026-08-06 16:51:01'),
(16, 15, '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 50000.00, \"Total_Amount\": 50000.00, \"CGST_amount\": 4500.00, \"SGST_amount\": 4500.00, \"Grand_Total\": 59000.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-06 16:51:01\"}', '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 14000.00, \"Total_Amount\": 14000.00, \"CGST_amount\": 1260.00, \"SGST_amount\": 1260.00, \"Grand_Total\": 16520.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-06 17:46:20\"}', '2026-08-06 17:46:20'),
(17, 15, '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 14000.00, \"Total_Amount\": 14000.00, \"CGST_amount\": 1260.00, \"SGST_amount\": 1260.00, \"Grand_Total\": 16520.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-06 17:46:20\"}', '{\"VendorChallan_Code\": \"VC_20260804_05\", \"Vendor_Name\": \"Shridhar \", \"Vendor_CompanyName\": \"New \", \"Vendor_CompanyAddress\": \"Pune\", \"VendorGST_No\": \"27AAA4347358\", \"Vendor_Phoneno\": \"9856235689\", \"Vendor_Email\": \"shridhar@gmail.com\", \"Sub_Total\": 13400.00, \"Total_Amount\": 13400.00, \"CGST_amount\": 1206.00, \"SGST_amount\": 1206.00, \"Grand_Total\": 15812.00, \"Mode_of_Transport\": \"Road Transport\", \"Transporter_Name\": \"Demo\", \"Vehicle_Number\": \"MH 12 AA 4423\", \"Remark\": \"Goods\", \"Product_Status\": \"Not Received\", \"Delivery_Status\": \"Dispatched\", \"Challan_Status\": \"Not Close\", \"Added_Date\": \"2026-08-04 15:31:58\", \"Updated_Date\": \"2026-08-06 17:47:27\"}', '2026-08-06 17:47:27');

-- --------------------------------------------------------

--
-- Table structure for table `vendorchallan_receipts`
--

CREATE TABLE `vendorchallan_receipts` (
  `Receipt_id` int(11) NOT NULL,
  `VendorChallan_id` int(11) NOT NULL,
  `Receipt_Number` varchar(100) NOT NULL,
  `Received_Date` datetime NOT NULL DEFAULT current_timestamp(),
  `Mode_of_Transport` varchar(255) DEFAULT NULL,
  `Transporter_Name` varchar(255) DEFAULT NULL,
  `Vehicle_Number` varchar(100) DEFAULT NULL,
  `Vendor_Note` text DEFAULT NULL,
  `Internal_Remark` text DEFAULT NULL,
  `Receipt_Status` varchar(100) NOT NULL DEFAULT 'Partial',
  `Added_Date` timestamp NOT NULL DEFAULT current_timestamp(),
  `Updated_Date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vendorproducts`
--

CREATE TABLE `vendorproducts` (
  `VendorProduct_id` int(11) NOT NULL,
  `VendorChallan_id` int(11) NOT NULL,
  `Product_Name` varchar(255) NOT NULL,
  `HSN_Code` varchar(255) NOT NULL,
  `Product_Quantity` int(11) NOT NULL,
  `Rate` decimal(12,2) NOT NULL,
  `SubTotal` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendorproducts`
--

INSERT INTO `vendorproducts` (`VendorProduct_id`, `VendorChallan_id`, `Product_Name`, `HSN_Code`, `Product_Quantity`, `Rate`, `SubTotal`) VALUES
(14, 11, 'Drills', '112150', 10, 1500.00, 15000.00),
(15, 12, 'Drills', '112150', 10, 1500.00, 15000.00),
(16, 13, 'End Mill', '121025', 25, 1000.00, 25000.00),
(23, 16, 'End Mills', '89569', 25, 1100.00, 27500.00);

--
-- Triggers `vendorproducts`
--
DELIMITER $$
CREATE TRIGGER `trg_vendorproduct_history` AFTER UPDATE ON `vendorproducts` FOR EACH ROW BEGIN

INSERT INTO vendorproduct_history
(
    VendorChallan_id,
    VendorProduct_id,
    old_product,
    new_product
)

VALUES
(
    OLD.VendorChallan_id,
    OLD.VendorProduct_id,

    JSON_OBJECT(
        'VendorChallan_id',OLD.VendorChallan_id,
        'Product_Name',OLD.Product_Name,
        'HSN_Code',OLD.HSN_Code,
        'Product_Quantity',OLD.Product_Quantity,
        'Rate',OLD.Rate,
        'SubTotal',OLD.SubTotal      
    ),

    JSON_OBJECT(
        'VendorChallan_id',NEW.VendorChallan_id,
        'Product_Name',NEW.Product_Name,
        'HSN_Code',NEW.HSN_Code,
        'Product_Quantity',NEW.Product_Quantity,
        'Rate',NEW.Rate,
        'SubTotal',NEW.SubTotal
    )
);

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `vendorproduct_history`
--

CREATE TABLE `vendorproduct_history` (
  `History_Id` int(11) NOT NULL,
  `VendorChallan_id` int(11) DEFAULT NULL,
  `VendorProduct_id` int(11) DEFAULT NULL,
  `old_product` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_product`)),
  `new_product` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_product`)),
  `Updated_Date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendorproduct_history`
--

INSERT INTO `vendorproduct_history` (`History_Id`, `VendorChallan_id`, `VendorProduct_id`, `old_product`, `new_product`, `Updated_Date`) VALUES
(1, 5, 7, '{\"VendorChallan_id\": 5, \"Product_Name\": \"Mill\", \"HSN_Code\": \"2745AAAA2324\", \"Operation_Perform\": \"Sparking\", \"Product_Quantity\": 20, \"Rate\": 1000.00, \"SubTotal\": 20000.00}', '{\"VendorChallan_id\": 5, \"Product_Name\": \"Mills\", \"HSN_Code\": \"27AAAA2324\", \"Operation_Perform\": \"Sparking\", \"Product_Quantity\": 25, \"Rate\": 1000.00, \"SubTotal\": 25000.00}', '2026-07-30 11:40:59'),
(2, 15, 19, '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', '2026-08-05 17:01:59'),
(3, 15, 20, '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mill\", \"HSN_Code\": \"501215\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mill\", \"HSN_Code\": \"501215\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '2026-08-05 17:01:59'),
(4, 15, 19, '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', '2026-08-05 17:03:33'),
(5, 15, 20, '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mill\", \"HSN_Code\": \"501215\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mills\", \"HSN_Code\": \"111000\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '2026-08-05 17:03:33'),
(6, 15, 19, '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', '2026-08-06 16:40:38'),
(7, 15, 20, '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mills\", \"HSN_Code\": \"111000\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mills\", \"HSN_Code\": \"111000\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '2026-08-06 16:40:38'),
(8, 15, 19, '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', '2026-08-06 16:51:01'),
(9, 15, 20, '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mills\", \"HSN_Code\": \"111000\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mills\", \"HSN_Code\": \"111000\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '2026-08-06 16:51:01'),
(10, 15, 19, '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 2000.00, \"SubTotal\": 40000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 200.00, \"SubTotal\": 4000.00}', '2026-08-06 17:46:20'),
(11, 15, 20, '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mills\", \"HSN_Code\": \"111000\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mills\", \"HSN_Code\": \"111000\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '2026-08-06 17:46:20'),
(12, 15, 19, '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 200.00, \"SubTotal\": 4000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"Rod\", \"HSN_Code\": \"112155\", \"Product_Quantity\": 20, \"Rate\": 170.00, \"SubTotal\": 3400.00}', '2026-08-06 17:47:27'),
(13, 15, 20, '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mills\", \"HSN_Code\": \"111000\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '{\"VendorChallan_id\": 15, \"Product_Name\": \"End Mills\", \"HSN_Code\": \"111000\", \"Product_Quantity\": 10, \"Rate\": 1000.00, \"SubTotal\": 10000.00}', '2026-08-06 17:47:27');

-- --------------------------------------------------------

--
-- Table structure for table `vendorproduct_operations`
--

CREATE TABLE `vendorproduct_operations` (
  `Operation_id` int(11) NOT NULL,
  `VendorProduct_id` int(11) NOT NULL,
  `Operation_Name` varchar(555) NOT NULL,
  `Rate` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendorproduct_operations`
--

INSERT INTO `vendorproduct_operations` (`Operation_id`, `VendorProduct_id`, `Operation_Name`, `Rate`) VALUES
(5, 16, 'Cutting', 0.00),
(6, 16, 'Grinding', 0.00),
(7, 16, 'Turning', 0.00),
(28, 23, 'Cutting', 1000.00),
(29, 23, 'Sharping', 100.00);

--
-- Triggers `vendorproduct_operations`
--
DELIMITER $$
CREATE TRIGGER `trg_vendorproduct_operations_history` AFTER UPDATE ON `vendorproduct_operations` FOR EACH ROW BEGIN
    INSERT INTO operations_history
    (
        Operation_id,
        VendorProduct_id,
        old_operation,
        new_operation
    )
    VALUES
    (
        OLD.Operation_id,
        OLD.VendorProduct_id,
        JSON_OBJECT(
            'VendorProduct_id', OLD.VendorProduct_id,
            'Operation_Name', OLD.Operation_Name,
            'Rate', OLD.Rate
        ),
        JSON_OBJECT(
            'VendorProduct_id', NEW.VendorProduct_id,
            'Operation_Name', NEW.Operation_Name,
            'Rate', NEW.Rate
        )
    );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `vendor_deletion_history`
--

CREATE TABLE `vendor_deletion_history` (
  `VendorDeletion_id` int(11) NOT NULL,
  `Vendor_id` int(11) NOT NULL,
  `Vendor_Code` varchar(100) DEFAULT NULL,
  `Deleted_By_Admin_id` int(11) NOT NULL,
  `Deleted_By_Admin_Name` varchar(255) DEFAULT NULL,
  `Deletion_Reason` text NOT NULL,
  `Deleted_Date` datetime DEFAULT current_timestamp(),
  `Vendor_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Vendor_Data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendor_deletion_history`
--

INSERT INTO `vendor_deletion_history` (`VendorDeletion_id`, `Vendor_id`, `Vendor_Code`, `Deleted_By_Admin_id`, `Deleted_By_Admin_Name`, `Deletion_Reason`, `Deleted_Date`, `Vendor_Data`) VALUES
(1, 5, 'VENDOR_4', 1, 'Vikas Tiwaskar', 'Vendor is not active.', '2026-09-08 17:13:51', '{\"Vendor_id\":5,\"Vendor_Code\":\"VENDOR_4\",\"Vendor_Name\":\"Pallavi Ahingare\",\"Vendor_CompanyName\":\"P A Industry\",\"VendorGST_No\":\"27AAAsd2435424234322\",\"Vendor_Phoneno\":\"9856895689\",\"Vendor_Email\":\"pallavi@gmail.com\",\"Vendor_CompanyAddress\":\"Pune\",\"Added_Date\":\"2026-09-08T11:43:20.000Z\",\"Updated_Date\":\"2026-09-08T11:43:20.000Z\",\"Vendor_Status\":\"Active\"}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`Admin_id`);

--
-- Indexes for table `admin_deletion_history`
--
ALTER TABLE `admin_deletion_history`
  ADD PRIMARY KEY (`AdminDeletion_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`Customer_id`);

--
-- Indexes for table `customer_deletion_history`
--
ALTER TABLE `customer_deletion_history`
  ADD PRIMARY KEY (`CustomerDeletion_id`);

--
-- Indexes for table `inletchallan`
--
ALTER TABLE `inletchallan`
  ADD PRIMARY KEY (`Challan_id`);

--
-- Indexes for table `inletchallan_deletion_history`
--
ALTER TABLE `inletchallan_deletion_history`
  ADD PRIMARY KEY (`Deletionchallan_id`);

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
-- Indexes for table `operations_history`
--
ALTER TABLE `operations_history`
  ADD PRIMARY KEY (`History_Id`);

--
-- Indexes for table `product_excess_stock`
--
ALTER TABLE `product_excess_stock`
  ADD PRIMARY KEY (`ExcessStock_id`);

--
-- Indexes for table `product_excess_stock_history`
--
ALTER TABLE `product_excess_stock_history`
  ADD PRIMARY KEY (`History_id`);

--
-- Indexes for table `salesorder`
--
ALTER TABLE `salesorder`
  ADD PRIMARY KEY (`SalesOrder_id`),
  ADD UNIQUE KEY `Sales_Order_Number` (`Sales_Order_Number`);

--
-- Indexes for table `salesorderitems`
--
ALTER TABLE `salesorderitems`
  ADD PRIMARY KEY (`SalesOrderItem_id`);

--
-- Indexes for table `salesorder_deletion_history`
--
ALTER TABLE `salesorder_deletion_history`
  ADD PRIMARY KEY (`SalesorderDeleted_id`);

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
-- Indexes for table `vendorchallan_deletion_history`
--
ALTER TABLE `vendorchallan_deletion_history`
  ADD PRIMARY KEY (`DeletionHistory_id`);

--
-- Indexes for table `vendorchallan_history`
--
ALTER TABLE `vendorchallan_history`
  ADD PRIMARY KEY (`History_Id`);

--
-- Indexes for table `vendorchallan_receipts`
--
ALTER TABLE `vendorchallan_receipts`
  ADD PRIMARY KEY (`Receipt_id`);

--
-- Indexes for table `vendorproducts`
--
ALTER TABLE `vendorproducts`
  ADD PRIMARY KEY (`VendorProduct_id`);

--
-- Indexes for table `vendorproduct_history`
--
ALTER TABLE `vendorproduct_history`
  ADD PRIMARY KEY (`History_Id`);

--
-- Indexes for table `vendorproduct_operations`
--
ALTER TABLE `vendorproduct_operations`
  ADD PRIMARY KEY (`Operation_id`);

--
-- Indexes for table `vendor_deletion_history`
--
ALTER TABLE `vendor_deletion_history`
  ADD PRIMARY KEY (`VendorDeletion_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `Admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `admin_deletion_history`
--
ALTER TABLE `admin_deletion_history`
  MODIFY `AdminDeletion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `Customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `customer_deletion_history`
--
ALTER TABLE `customer_deletion_history`
  MODIFY `CustomerDeletion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inletchallan`
--
ALTER TABLE `inletchallan`
  MODIFY `Challan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `inletchallan_deletion_history`
--
ALTER TABLE `inletchallan_deletion_history`
  MODIFY `Deletionchallan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `inletchallan_history`
--
ALTER TABLE `inletchallan_history`
  MODIFY `History_Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `inletproducts`
--
ALTER TABLE `inletproducts`
  MODIFY `InletProduct_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `inletproducts_history`
--
ALTER TABLE `inletproducts_history`
  MODIFY `History_Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `operations_history`
--
ALTER TABLE `operations_history`
  MODIFY `History_Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_excess_stock`
--
ALTER TABLE `product_excess_stock`
  MODIFY `ExcessStock_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_excess_stock_history`
--
ALTER TABLE `product_excess_stock_history`
  MODIFY `History_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesorder`
--
ALTER TABLE `salesorder`
  MODIFY `SalesOrder_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `salesorderitems`
--
ALTER TABLE `salesorderitems`
  MODIFY `SalesOrderItem_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `salesorder_deletion_history`
--
ALTER TABLE `salesorder_deletion_history`
  MODIFY `SalesorderDeleted_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vendor`
--
ALTER TABLE `vendor`
  MODIFY `Vendor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `vendorchallan`
--
ALTER TABLE `vendorchallan`
  MODIFY `VendorChallan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `vendorchallan_deletion_history`
--
ALTER TABLE `vendorchallan_deletion_history`
  MODIFY `DeletionHistory_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `vendorchallan_history`
--
ALTER TABLE `vendorchallan_history`
  MODIFY `History_Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `vendorchallan_receipts`
--
ALTER TABLE `vendorchallan_receipts`
  MODIFY `Receipt_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vendorproducts`
--
ALTER TABLE `vendorproducts`
  MODIFY `VendorProduct_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `vendorproduct_history`
--
ALTER TABLE `vendorproduct_history`
  MODIFY `History_Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `vendorproduct_operations`
--
ALTER TABLE `vendorproduct_operations`
  MODIFY `Operation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `vendor_deletion_history`
--
ALTER TABLE `vendor_deletion_history`
  MODIFY `VendorDeletion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
