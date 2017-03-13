from troposphere import Template, Parameter, Join, Ref, Equals
from troposphere.s3 import Bucket, BucketPolicy, PublicRead, WebsiteConfiguration, LifecycleConfiguration, LifecycleRule
from awacs.aws import Statement, Allow, Principal, Policy, Action, Condition, StringEquals

t = Template()
t.add_description("S3 Bucket for Tube Alert content")

BucketName = t.add_parameter(Parameter(
    "BucketName",
    Type="String",
    Description="The name of the bucket. Must be the hostname",
))

Bucket = t.add_resource(Bucket(
    "Bucket",
    BucketName=Ref(BucketName),
    AccessControl=PublicRead,
    WebsiteConfiguration=WebsiteConfiguration(
        IndexDocument="index.html",
        ErrorDocument="error.html"
    ),
    LifecycleConfiguration=LifecycleConfiguration(Rules=[
        LifecycleRule(
            Id="S3BucketRule001",
            Status="Enabled",
            ExpirationInDays=30
        ),
    ])
))

print(t.to_json())