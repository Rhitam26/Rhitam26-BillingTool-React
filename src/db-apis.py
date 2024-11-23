from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import boto3
from boto3.dynamodb.conditions import Key
import os
from dotenv import load_dotenv
import json
from decimal import Decimal

app = FastAPI()
AWS_ACCESS_KEY="AKIASWWZMPMPGGODJM4Z"
AWS_SECRET_KEY="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"
AWS_REGION="ap-south-1"
# Initialize a DynamoDB client
print("REGION ", AWS_REGION)
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION, aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)
TABLE_NAME = 'V-Tel-Invoices'
table = dynamodb.Table(TABLE_NAME)

class Product(BaseModel):
    name: str
    price: str
    quantity: str
    discount : int

class Invoice(BaseModel):
    InvoiceNumber: str
    date: str
    upi: float
    cash : float
    credit : float
    amount_paid: float
    invoice_status : str


@app.get("/")
async def hello():
    try:
        return {
        "message" :"Hello"
        }
    except Exception as e:
        print("ERROR MESSAGE ", e)


@app.get("/check-table/")
async def check_table():
    try:
        table = dynamodb.Table(TABLE_NAME)
        table.load()  # Load the table to check if it exists
        response = table.scan(Limit=1)
        if 'Items' in response and len(response['Items']) > 0:
            return {"exists": True, "has_data": True}
        else:
            return {"exists": True, "has_data": False}
    except dynamodb.meta.client.exceptions.ResourceNotFoundException:
        return {"exists": False, "has_data": False}

@app.get("/invoices/{InvoiceNumber}", response_model=Invoice)
def get_invoice(InvoiceNumber: str):
    try:
        response = table.get_item(Key={'InvoiceNumber': InvoiceNumber})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return response['Item']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/invoices", response_model=Invoice)
def create_invoice(invoice: Invoice):
    try:
        print("INPUT :",invoice)
        # convert the invoice object to a dictionary
        invoice_json = invoice.model_dump_json()
        # convert invoice_json(string) to json

        invoice_data = json.loads(invoice_json)
        deci_json_data = json.loads(json.dumps(invoice_data), parse_float= Decimal)

        # print(deci_json_data)
        response = table.put_item(Item=deci_json_data)
        print("RESPONSE  :",response)
        status_code = response["ResponseMetadata"]["HTTPStatusCode"]

        if response["ResponseMetadata"]["HTTPStatusCode"] ==200 :
            print("DATA SAVED")

            return {"status_code": 200, "data":"invoice created"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@app.put("/invoices/{InvoiceNumber}", response_model=Invoice)
def update_invoice(InvoiceNumber: str, invoice: Invoice):
    try:
        response = table.update_item(
            Key={'InvoiceNumber': InvoiceNumber},
            UpdateExpression="set date=:d, amount_due=:a, products=:p, discount=:di, payment_method=:pm, amount_paid=:ap, credit=:c",
            ExpressionAttributeValues={
                ':d': invoice.date,
                ':a': invoice.amount_due,
                ':p': [product.model_dump() for product in invoice.products],
                ':di': invoice.discount,
                ':pm': invoice.payment_method,
                ':ap': invoice.amount_paid,
                ':c': invoice.credit
            },
            ReturnValues="UPDATED_NEW"
        )
        return response['Attributes']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

