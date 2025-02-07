from flask import Flask, request, jsonify, abort
import boto3
import json
from decimal import Decimal
from pydantic import BaseModel
from typing import List, Optional
from boto3.dynamodb.conditions import Key
import os
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime
import gspread
from oauth2client.service_account import ServiceAccountCredentials


# Load environment variables from .env file
load_dotenv()



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration for AWS DynamoDB
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY', 'AKIASWWZMPMPGGODJM4Z')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_KEY', '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')
AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')

dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION, aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)
INVOICE_TABLE = 'V-Tel-Invoices'
PRODUCT_TABLE = 'V-Tel-Products'

table_invoice = dynamodb.Table(INVOICE_TABLE)
table_product = dynamodb.Table(PRODUCT_TABLE)

async def authenticate_google_sheets(credentials_file, sheet_name):
    scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name(credentials_file, scope)
    client = gspread.authorize(creds)
    sheet = client.open_by_key("1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4")
    return sheet


async def get_google_sheets_data(sheet, sheet_index):
    records = sheet.get_worksheet(sheet_index).get_all_records()
    return records

class PrimaryProduct(BaseModel):
    name: str
    quantity: str
    type: str
    category: str
    company: str
    brand: str
    primaryBarcode: str
    purchasePrice: str
    defaultSalesPrice: str
    silverPrice: str
    goldPrice: str
    platinumPrice: str
    diamondPrice: str
    warehouse: str
    secondaryBarcode: Optional[str]
    secondaryBarcodeStock: Optional[str]
    secondaryBarcodeWarehouse: Optional[str]

class KacchaProduct(BaseModel):
    name: str
    primaryBarcode: str
    purchasePrice: str
    defaultSalesPrice: str
    silverPrice: str
    goldPrice: str
    platinumPrice: str
    diamondPrice: str
    warehouse: str
    type: str
    category: str
    company: str
    brand: str
    linkedToPrimary: str


class Invoice(BaseModel):
    InvoiceNumber: str
    date: int
    customerName: str
    products: list[list]
    upi: float
    cash: float
    credit: float
    amount_paid: float
    invoice_status: str

# create a customer class where mobile and adress are optional
class Customer(BaseModel):
    customerName: str
    mobile: str = None
    address: str = None
    customerBalance: float = 0.0

class User(BaseModel):
    UserID: str
    password: str
    role: str= "User"

async def update_google_sheets(products_data):
    try:
        sheet = await authenticate_google_sheets('g-auth.json', 'products')
        worksheet = sheet.get_worksheet(3)  # Adjust worksheet index as needed

        # Create a dictionary to store primary product details
        primary_products = {}
        rows_to_add = []
        
        # First pass: collect primary product details and create their rows
        for product in products_data['products']:
            if product.get('type') == 'primary':
                primary_products[product['primaryBarcode']] = {
                    'category': product['category'],
                    'company': product['company'],
                    'brand': product['brand']
                }
                row = [
                    product['name'],
                    product['quantity'],
                    product['type'],
                    product['category'],
                    product['company'],
                    product['brand'],
                    product['primaryBarcode'],
                    product['purchasePrice'],
                    product['defaultSalesPrice'],
                    product['silverPrice'],
                    product['goldPrice'],
                    product['platinumPrice'],
                    product['diamondPrice'],
                    product['warehouse'],
                    product.get('secondaryBarcode', ''),
                    product.get('secondaryBarcodeStock', ''),
                    product.get('secondaryBarcodeWarehouse', '')
                ]
                rows_to_add.append(row)

        # Second pass: create kaccha product rows with inherited details
        for product in products_data['products']:
            if product.get('type') == 'kaccha':
                primary_details = primary_products.get(product['linkedToPrimary'], {})
                row = [
                    product['name'],
                    '',  # quantity
                    product['type'],
                    primary_details.get('category', ''),
                    primary_details.get('company', ''),
                    primary_details.get('brand', ''),
                    product['primaryBarcode'],
                    product['purchasePrice'],
                    product['defaultSalesPrice'],
                    product['silverPrice'],
                    product['goldPrice'],
                    product['platinumPrice'],
                    product['diamondPrice'],
                    product['warehouse'],
                    '',  # secondary barcode
                    '',  # secondary stock
                    ''   # secondary warehouse
                ]
                rows_to_add.append(row)

        # Get the next empty row
        next_row = len(worksheet.get_all_values()) + 1
        
        # Update the sheet
        if rows_to_add:
            worksheet.insert_rows(rows_to_add, next_row)
        
        return True
    except Exception as e:
        print(f"Error updating Google Sheets: {str(e)}")
        return False

@app.route('/')
def hello():
    try:
        return jsonify({"message": "Hello"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/check-table')
def check_table():
    try:
        table = dynamodb.Table(INVOICE_TABLE)
        table.load()  # Load the table to check if it exists
        response = table.scan(Limit=1)
        if 'Items' in response and len(response['Items']) > 0:
            return jsonify({"exists": True, "has_data": True})
        else:
            return jsonify({"exists": True, "has_data": False})
    except dynamodb.meta.client.exceptions.ResourceNotFoundException:
        return jsonify({"exists": False, "has_data": False})


@app.route('/invoices/<InvoiceNumber>', methods=['GET'])
def get_invoice(InvoiceNumber):
    try:
        response = table_invoice.get_item(Key={'InvoiceNumber': InvoiceNumber})
        if 'Item' not in response:
            abort(404, description="Invoice not found")
        return jsonify(response['Item'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/invoices', methods=['GET'])
def get_invoices():
    try:
        response = table_invoice.scan()
        return jsonify(response['Items'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/invoices', methods=['POST'])
def create_invoice():
    try:
        invoice_data = request.json
        print("Invoice Data ", invoice_data)
        print("############################################")
        invoice = Invoice(**invoice_data)
        # Convert Pydantic model to dictionary
        invoice_dict = invoice.model_dump_json()
        # convert the invoice string to a dictionary
        invoice_dict = json.loads(invoice_dict)
        # Convert float to Decimal
        invoice_dict = json.loads(json.dumps(invoice_dict), parse_float=Decimal)
        print("Invoice Dict ", type(invoice_dict))
        # Save to DynamoDB
        response = table_invoice.put_item(Item=invoice_dict)
        if response["ResponseMetadata"]["HTTPStatusCode"] == 200:
            return jsonify({"status_code": 200, "data": "invoice created"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/invoices/<InvoiceNumber>', methods=['PUT'])
def update_invoice(InvoiceNumber):
    try:
        invoice_data = request.json
        invoice = Invoice(**invoice_data)
        response = table_invoice.update_item(
            Key={'InvoiceNumber': InvoiceNumber},
            UpdateExpression="set date=:d, amount_due=:a, products=:p, discount=:di, payment_method=:pm, amount_paid=:ap, credit=:c",
            ExpressionAttributeValues={
                ':d': invoice.date,
                ':a': invoice.amount_paid,  # You might need to adjust fields based on actual invoice
                ':p': [],  # Products to be added based on your logic
                ':di': 0,  # Adjust discount
                ':pm': 'cash',  # Adjust payment method
                ':ap': invoice.amount_paid,
                ':c': invoice.credit
            },
            ReturnValues="UPDATED_NEW"
        )
        return jsonify(response['Attributes'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/crt-prd', methods=['POST'])
def create_product():
    try:
        product_data = request.json
        product = Product(**product_data)
        product_dict = product.model_dump_json()
        product_dict = json.loads(product_dict, parse_float=Decimal)
   
        response = table_product.put_item(Item=product_dict)
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/products/<bar_code_id>', methods=['PUT'])
def update_product():
    try:
        products_data = request.json
        
        # Process and save to DynamoDB
        with table_product.batch_writer() as batch:
            for product in products_data['products']:
                if product.get('type') == 'primary':
                    product_model = PrimaryProduct(**product)
                else:
                    product_model = KacchaProduct(**product)
                
                # Convert to dictionary and handle Decimal conversion
                product_dict = json.loads(product_model.json())
                product_dict = json.loads(json.dumps(product_dict), parse_float=Decimal)
                
                batch.put_item(Item=product_dict)

        # Update Google Sheets
        sheets_update_success = update_google_sheets(products_data)

        response = {
            "status": "success",
            "message": "Products created successfully",
            "database_update": "success",
            "sheets_update": "success" if sheets_update_success else "failed"
        }
        
        return jsonify(response), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/products', methods=['GET'])
def get_products():
    try:
        response = table_product.scan()
        return jsonify(response['Items'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/batch-create-products', methods=['POST'])
async def batch_create_products():
    
        products_data = request.json
        
        # Create a dictionary to store primary product details
        primary_products = {}
        
        # First pass: collect primary product details
        for product in products_data['products']:
            if product.get('type') == 'primary':
                primary_products[product['primaryBarcode']] = {
                    'category': product['category'],
                    'company': product['company'],
                    'brand': product['brand']
                }
        
        # Process and save to DynamoDB
        with table_product.batch_writer() as batch:
            for product in products_data['products']:
                if product.get('type') == 'primary':
                    product_model = PrimaryProduct(**product)
                else:
                    # Inherit details from primary product
                    primary_details = primary_products.get(product['linkedToPrimary'], {})
                    product.update({
                        'category': primary_details.get('category', ''),
                        'company': primary_details.get('company', ''),
                        'brand': primary_details.get('brand', '')
                    })
                    product_model = KacchaProduct(**product)
                
                # Convert to dictionary and handle Decimal conversion
                product_dict = json.loads(product_model.model_dump_json())
                product_dict = json.loads(json.dumps(product_dict), parse_float=Decimal)
                
                batch.put_item(Item=product_dict)

        # Update Google Sheets
        sheets_update_success = await update_google_sheets(products_data)

        response = {
            "status": "success",
            "message": "Products created successfully",
            "database_update": "success",
            "sheets_update": "success" if sheets_update_success else "failed"
        }
        
        return jsonify(response), 200


@app.route('/batch-create-invoices', methods=['POST'])
def batch_create_invoices():
    try:
        invoices_data = request.json
        with table_invoice.batch_writer() as batch:
            for invoice_data in invoices_data:
                invoice = Invoice(**invoice_data)
                invoice_dict = invoice.model_dump_json()
                invoice_dict = json.loads(invoice_dict)
                invoice_dict = json.loads(json.dumps(invoice_dict), parse_float=Decimal)

                batch.put_item(Item=invoice_dict)
        return jsonify(invoices_data), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/get-customer-invoices/<customerName>', methods=['GET'])
def get_customer_invoices(customerName):
    try:
        response = table_invoice.scan(FilterExpression=Key('customerName').eq(customerName))
        return jsonify(response['Items'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-invoice-date-range/<start_date>/<end_date>', methods=['GET'])
def get_invoice_date_range(start_date, end_date):
    try:
        response = table_invoice.scan(FilterExpression=Key('date').between(start_date, end_date))
        return jsonify(response['Items'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/get-filtered-invoices', methods=['POST'])
def get_filtered_invoices():
    try:
        input_data = request.json
        print("Input Data", input_data)
        print("Customer Name", input_data['customerName'])
        if 'customerName' in input_data.keys():
            # Filter by customer name if provided between dates
            print("Inside if..")
            customer_name = input_data['customerName']
            start_date = input_data['start_date']
            end_date = input_data['end_date']
            print("Customer Name", customer_name)
         
            # convert the dates to epoch
            if str(start_date).__contains__("-"):
                start_date = datetime.strptime(start_date, "%Y-%m-%d")
                unix_start_date = int(start_date.timestamp())
                # convert to milliseconds
                unix_start_date = unix_start_date * 1000
            else:
                unix_start_date = int(start_date)
            if str(end_date).__contains__("-"):
                end_date = datetime.strptime(end_date, "%Y-%m-%d")
                unix_end_date = int(end_date.timestamp())
                # convert to milliseconds
                unix_end_date = unix_end_date * 1000
            else:
                unix_end_date = int(end_date)
        
            print("Unix Start Date", unix_start_date)
            # unix_start_date= 1731735720837
            print("Unix End Date", unix_end_date)
            response = table_invoice.scan(FilterExpression=Key('customerName').eq(customer_name) & Key('date').between(unix_start_date,unix_end_date))
            # print("Response", response.items())
            print("________________________________________________________")
            sample_response = response['Items']
            print("Sample Response", sample_response)
            
        else: 
            # Filter by date range if provided
            print("Inside else")
            start_date = input_data['start_date']
            end_date = input_data['end_date']
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
            unix_start_date = int(start_date.timestamp())
            end_date = datetime.strptime(end_date, "%Y-%m-%d")
            unix_end_date = int(end_date.timestamp())
            response = table_invoice.scan(FilterExpression=Key('date').between(unix_start_date, unix_end_date))
        return jsonify(response['Items'])
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/batch-create-customers', methods=['POST'])
def create_customers():
    try:
        customers_data = request.json
        table_customer = dynamodb.Table('V-Tel-Customers')
        with table_customer.batch_writer() as batch:
            for customer_data in customers_data:
                customer = Customer(**customer_data)
                customer_dict = customer.json()
                print("type of customer_dict", type(customer_dict))
                customer_dict = json.loads(customer_dict, parse_float=Decimal)
                batch.put_item(Item=customer_dict)
        return jsonify(customers_data), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/get-customers/<customerList>', methods=['GET'])
def get_customer(customerList):
    try:
        customerList = customerList.split(',')
        print("Customer List", customerList)
        table_customer = dynamodb.Table('V-Tel-Customers')
        response = dynamodb.batch_get_item(
            RequestItems={
                'V-Tel-Customers': {
                    'Keys': [
                        {
                            'customerName': customer
                        } for customer in customerList
                    ]
                }
            }
        )
        print("Response", response)
        # customer_details = response['Responses']['V-Tel-Customers']
        
        return jsonify(response['Responses']['V-Tel-Customers'])

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/create-user', methods=['POST'])
def create_user():
    try:
        print("Request", request.json)
        user_data = request.json
        table_user = dynamodb.Table('V-Tel-Users')
        response =[]
        for user_item in user_data:
   
            # Create a User object from each dictionary in the list
            user = User(**user_item)
            user_dict = user.dict()  # Convert Pydantic model to dictionary
            
            # Perform further processing (e.g., storing in DynamoDB)
            res= table_user.put_item(Item=user_dict)
            print("Response", res)
            
            # Collect successful responses
            response.append({"UserID": user.UserID, "status": "success"})
    except Exception as e:
        # Handle errors for each individual item
        response.append({"error": str(e), "data": user_item})

        # Return a consolidated response
    return {"data": response}, 200
    
@app.route('/get-users', methods=['GET'])
def get_users():
    try:
        table_user = dynamodb.Table('V-Tel-Users')
        response = table_user.scan()
        return jsonify(response['Items'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-user/<username>', methods=['GET'])
def get_user(username):
    try:
        table_user = dynamodb.Table('V-Tel-Users')
        response = table_user.get_item(Key={'UserID': username})
        return jsonify(response['Item'])
    except Exception as e:

        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
