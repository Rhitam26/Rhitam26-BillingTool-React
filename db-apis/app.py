import gspread
from oauth2client.service_account import ServiceAccountCredentials
import boto3
from botocore.exceptions import ClientError
import requests
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
from collections import defaultdict
# from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException





# Function to authenticate with Google Sheets and get the sheet data
def authenticate_google_sheets(credentials_file, sheet_name):
    # Define the scope of access
    scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
    
    # Authenticate with Google Sheets API using the credentials file
    creds = ServiceAccountCredentials.from_json_keyfile_name(credentials_file, scope)
    client = gspread.authorize(creds)
    
    # Open the Google Sheet by name
    sheet = client.open_by_key("1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4")
    # sheet = sheet.get_worksheet(2)
    return sheet

# Function to get data from the sheet
def get_google_sheets_data(sheet, sheet_index):
    # Get all records from the 
    records = sheet.get_worksheet(sheet_index).get_all_records()
    # print("Records ", records)
    return records

async def update_db(updated_products):
    base_url = "http://127.0.0.1:5000/products"
    for product in updated_products:
        url = f"{base_url}/{product['bar_code_id']}"
        print("URL ", url)
        response = requests.put(url, json=product)
        print("Response ", response.json())

    return response.json()

origins = [
    "http://localhost:3000",  # Replace with the actual origin of your React app
    "http://localhost:3000/login"  # Replace with the actual deployed origin of your React app
]

app = FastAPI()

# Configuration for JWT
class Settings(BaseModel):
    authjwt_secret_key: str = "Margherita@26VTel-Comp"
    
    class Config:
        str_strip_whitespace = True  # Updated for Pydantic 2.x

@AuthJWT.load_config
def get_config():
    return Settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

@app.post("/update-products")
async def update_products():
    try:
        # Google Sheets credentials and sheet name
        google_credentials_file = 'g-auth.json'
        sheet_name = 'Sheet2'
        # get the data from google sheets
        sheet = authenticate_google_sheets(google_credentials_file, sheet_name)
        sheet_index = 3
        sheet_data = get_google_sheets_data(sheet, sheet_index)
        print("Sheet data ", sheet_data)

        # get the data from dynamodb
        url = "http://127.0.0.1:5000/products"
        response =  requests.get(url)
        products = response.json()
        print("*****************************")
        print("Products ", products)

        # check if the product exists in the database
        updated_products = []
        new_products = []

        for row in sheet_data:
            found = False
            for product in products:
        
                if ((str(row['Bar Code']).strip() == str(product["bar_code_id"]).strip() and str(row["Price"]) != str(product["price"])) or (str(row['Current Stock']).strip() == str(product["current_stock"]).strip() )):
                    found = True
                    sample_dict = {
                        "bar_code_id": str(row['Bar Code']),
                        "product_name": str(row['Product Name']),
                        "price": float(row['Price']),
                        "current_stock": str(row['Current Stock']),
                        "category": str(row['Category'])
                    }
                    updated_products.append(sample_dict)
                    break
            if not found:
                sample_dict = {
                    "bar_code_id": str(row['Bar Code']),
                    "product_name": str(row['Product Name']),
                    "price": float(row['Price']),
                    "current_stock": int(row['Current Stock']),
                    "category": str(row['Category'])
                }
                new_products.append(sample_dict)

        print("Updated Products ", updated_products)
        print("&&&&&&&&&&&&& &&&&&&&&&&&&&&&&")
        print("New Products ", new_products)

        if len(updated_products) > 0:
            resp = await update_db(updated_products)
     
            print("Updated products ", resp)
        if len(new_products) > 0:
            url = "http://127.0.0.1:5000/batch-create-products"
            # format the data to be sent to the endpoint

            response = requests.post(url, json=new_products)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating products: {e}")
        
@app.post("/auth")
async def authenticate(item: dict):
    try:
        print("ITEM ", item)
        user_id = item['user']
        password = item['pwd']
        url = "http://127.0.0.1:5000/get-users/"+user_id
        response = requests.get(url)
        user = response.json()
        print("User ", user)
        if user:
            if user[0]['password'] == password:
                access_token = jwt.encode({"sub": user_id}, SECRET_KEY, algorithm=ALGORITHM)
                
                return {"access_token": access_token, "token_type": "bearer"}
            else:
                return {"data": "Invalid password"}
        else:
            return {"data": "User not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
def login(user: OAuth2PasswordRequestForm = Depends(), Authorize: AuthJWT = Depends()):
    # get the userid 
    user_id = user.username
    password = user.password

    print("USER DETAILS ", user)
    print("====================================")
    print("Authorize ", Authorize)
    print("====================================")
    url = "http://127.0.0.1:5000/get-user/"+user_id
    print("URL ", url)
    print("password ", password)
    print("UserID", user_id)
    response = requests.get(url)
    user_resp = response.json()
    print("User ", user_resp)
    role = user_resp['role']
   
    access_token = Authorize.create_access_token(subject=user_id)
   
    return {"access_token": access_token, "token_type": "bearer", "role": role}

@app.post("/refresh")
def refresh(Authorize: AuthJWT = Depends()):
    Authorize.jwt_refresh_token_required()
    current_user = Authorize.get_jwt_subject()
    print("Current User ", current_user)
    access_token = Authorize.create_access_token(subject=current_user)
    return {"access_token": access_token}


# this endpoint is used to update the invoice in google sheets. It takes type of invoice, if "Hold" then it will look up for existing invoice and update it, if "Fresh" then it will create a new invoice
@app.post("/gsheet-update-invoice")
async def update_invoice(item: dict):
    try:
        # Google Sheets credentials and sheet name
        google_credentials_file = 'g-auth.json'
        sheet_name = 'Invoices'
        # get the data from google sheets
        sheet = authenticate_google_sheets(google_credentials_file, sheet_name)
        sheet_index = 2
        sheet_data = get_google_sheets_data(sheet, sheet_index)
        # print("Sheet data ", sheet_data)
        print("*****************************")
        # check if the invoice exists in the database
        invoice_number = item['InvoiceNumber']
        invoice_status = item['invoice_status']
        print("Invoice Number ", invoice_number)
        print("Invoice Status ", invoice_status)
        print(item)
        found = False
        row_index = 1
        for row in sheet_data:
            row_index += 1
            if str(row['Invoice Number']) == str(invoice_number):
                found = True
                break
        if not found:
            # enter data in the google sheet column 1 is Invoice Number and column 2 is Invoice Details
            sheet_index = 2
            print("Row Index ", row_index)
            sheet.get_worksheet(sheet_index).insert_row([invoice_number, str(item)], row_index)
        else:
            # update the invoice
            sheet_index = 2
            sheet.get_worksheet(sheet_index).update_cell(row_index, 2, str(item))
        return {"data": "Invoice updated successfully"}
    except Exception as e:
        print("ERROR ", e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/update-invoice")
def update_invoice():
    
    credentials_file = 'g-auth.json'
    sheet_name = 'Invoices'
    sheet_index = 2
    sheet = authenticate_google_sheets(credentials_file, sheet_name)
    sheet_data = get_google_sheets_data(sheet, sheet_index)
    # print("Sheet data:", sheet_data)
    invoice_list =[]
    for row in sheet_data:
        print(str(row['Invoice Number']))
        invoice_details = row["Invoice Details"]
        # replace single quotes with double quotes
        invoice_details = invoice_details.replace("'", "\"")
        invoice_details = json.loads(invoice_details)
        print("Invoice Date:", invoice_details['date'])

        sample_dict = {
            "InvoiceNumber": str(row['Invoice Number']),
            "date": int(invoice_details['date']),
            "customerName": str(invoice_details['customerName']),
            "upi": float(invoice_details['upi']),
            "cash": float(invoice_details['cash']),
            "credit": float(invoice_details['credit']),
            "amount_paid": float(invoice_details['amount_paid']),
            "invoice_status": str(invoice_details['invoice_status']),
            "products": invoice_details['products']
        }
        invoice_list.append(sample_dict)

    batch_create_url = "http://127.0.0.1:5000/batch-create-invoices"

    # call update customer endpoint
    
    response = requests.post("http://127.0.0.1:8000/update-customers")
    print("Response ***** ", response.json())


    response = requests.post(batch_create_url, json=invoice_list)
    return {"status": "success", "response": response.json()}
    # except Exception as e:
    #     return {"error": str(e)}, 500

@app.post("/update-customers")
async def update_customers():
    try:
        # Google Sheets credentials and sheet name
        credentials_file = 'g-auth.json'
        sheet_name = 'Invoices'
        sheet_index = 2
        sheet = authenticate_google_sheets(credentials_file, sheet_name)
        sheet_data = get_google_sheets_data(sheet, sheet_index)
        print("Sheet data:", sheet_data)
        # Initialize dictionaries to store totals
        total_paid = defaultdict(float)
        total_credit = defaultdict(float)
        for record in sheet_data:
            details = json.loads(record['Invoice Details'].replace("'", '"'))
            customer_name = details['customerName']
            invoice_status = details['invoice_status']
            if invoice_status == "Hold":
                continue
            # print("Customer Name:", customer_name)
            upi = float(details.get('upi', 0))
            cash = float(details.get('cash', 0))
            credit = float(details.get('credit', 0))
            total_paid[customer_name] += upi + cash
            total_credit[customer_name] += credit
        
        print("Total Paid:", total_paid)

        # Print results
        for customer in total_paid:
            print(f"Customer: {customer}")
            print(f"  Total Paid (UPI + Cash): {total_paid[customer]}")
            print(f"  Total Credit: {total_credit[customer]}")

        customers_str = ",".join(total_paid.keys())
        print("Customers ", customers_str)
        if customers_str == "":
            return {"status": "success", "response": "No customers to update"}
        
        current_customer_details = requests.get("http://127.0.0.1:5000/get-customers/"+customers_str)
        current_customer_details = current_customer_details.json()
        print("Current Customer Details ", current_customer_details)
        for customer in current_customer_details:
            customer_name = customer['customerName']
            customer['customerBalance']= float(customer['customerBalance'])
            print("TYPE  :  ", type(customer['customerBalance']))
            # New Balance = (Existing Balance + New Credit) - New Paid
            if total_credit[customer_name] != 0:
                customer['customerBalance'] += total_credit[customer_name]
            if total_paid[customer_name] != 0:
                customer['customerBalance'] -= float(total_paid[customer_name])
            

        print("Updated Customer Details ", current_customer_details)


        #################### remove the old invoices from google sheets without status "Hold"  ############################

        # update the customers

        url = "http://127.0.0.1:5000/batch-create-customers"
        response = requests.post(url, json=current_customer_details)
        print("Response ", response.json())

        sheet_index = 2
        sheet = sheet.get_worksheet(sheet_index)
        records = sheet.get_all_records()
        # print("Records ", records)
        rows_to_delete = []
        for idx, record in enumerate(records):
            details = json.loads(record['Invoice Details'].replace("'", '"'))
            if details['invoice_status'] != "Hold":
                rows_to_delete.append(idx+2)
            
        print("Rows to delete ", rows_to_delete)

        for row in reversed(rows_to_delete):
            sheet.delete_rows(row)

        print("Deleted the old invoices")
        return {"status": "success", "response": current_customer_details}
       
    except Exception as e:
        return {"error": str(e)}, 500

     
@app.get("/admin")
def admin_only(Authorize: AuthJWT = Depends()):
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    customers_str= str(current_user)
    current_customer_details = requests.get("http://127.0.0.1:5000/get-customers/"+customers_str)
    if current_customer_details["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    return {"message": "Welcome Admin"}

@app.post("/create-supplier")
def create_supplier(item: dict):
    try:
        url = "http://"
        return {"status": "success", "response": "Supplier created successfully"}
    except Exception as e:
        return {"error": str(e)}, 500